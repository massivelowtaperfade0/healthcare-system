import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'; 
import { UserRole, EventType, MembershipStatus } from '../generated/prisma/client';
import { CreateStaffDto } from './dto/create-staff.dto';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { LoginDto } from './dto/login.dto';
import { v4 as uuidv4 } from 'uuid'
import { CreateClaimDto, VerifyClaimDto } from './dto/patient-validation';
import { createHash } from 'crypto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
        private redis: RedisService,
        private jwt: JwtService
    ) { }

    async validateRefreshTokens(refreshToken: string) {
        let payload: any;
        try {
            payload = await this.jwt.verifyAsync(refreshToken, {
                secret: this.config.get("REFRESH_TOKEN")
            });
        } catch {
            throw new ForbiddenException("Invalid refresh token");
        }

        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            include: {
                memberships: {
                    where: { status: MembershipStatus.ACTIVE },
                }
            }
        });

        const validToken = await this.prisma.refreshToken.findUnique({
            where: {
                id: payload.jti,
                userId: payload.sub
            }
        })

        if (!user || !validToken ||
            validToken.revokedAt ||
            validToken.expiresAt < new Date()
        ) {
            throw new ForbiddenException("Access Denied: Session revoked or user inactive");
        }

        const isMatch = await argon.verify(validToken.tokenHash, refreshToken);
        if (!isMatch) {
            await this.prisma.activityLog.create({
                data: {
                    userId: user.id,
                    eventType: EventType.SECURITY_ANOMALY_DETECTED,
                    metadata: {
                        reason: "Invalid Refresh Tokens detected",
                        timeStamp: new Date(Date.now()).toISOString()
                    }
                }
            })
            throw new ForbiddenException("Access Denied");
        }

        return await this.prisma.$transaction(async (tx) => {

            await this.prisma.refreshToken.update({
                where: {
                    id: validToken.id,
                },
                data: {
                    revokedAt: new Date(),
                }
            });

            const newTokens = await this.signToken(
                user.id,
                payload.email,
                payload.memberships
            )

            await this.saveRefreshToken(user.id, newTokens.jti, newTokens.refreshToken, tx);

            return newTokens;
        })
    }


    async signToken(
        userId: string,
        email: string,
        memberships: any[]
    ) {
        const jti = uuidv4();
        const orgs = memberships.map(m => m.organizationId)

        const accessTokenPayload = {
            sub: userId,
            email,
            jti,
            orgs
        }

        const refreshTokenPayload = {
            sub: userId,
            email,
            jti,
        }

        const accessToken = await this.jwt.signAsync(
            accessTokenPayload, {
            expiresIn: '15m',
            secret: this.config.get('ACCESS_TOKEN'),
        }
        )

        const refreshToken = await this.jwt.signAsync(
            refreshTokenPayload, {
            expiresIn: '7d',
            secret: this.config.get('REFRESH_TOKEN'),
        }
        )

        return {
            accessToken: accessToken,
            refreshToken: refreshToken,
            jti: jti,
        };
    }

    async saveRefreshToken(userId: string, jti: string, refreshToken: string, tx?: any) {

        // use local transaction if availabel
        const client = tx || this.prisma;
        const tokenHash = await argon.hash(refreshToken);

        await client.refreshToken.create({
            data: {
                id: jti,
                tokenHash,
                userId,
                expiresAt: new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000
                )
            }
        })
    }

    // only non-admin users or patients only
    async userSignUp(
        dto: RegisterDto,
    ) {
        const FloatId = this.config.get('FLOAT_ID');
        const hash = await argon.hash(dto.password)

        try {
            const userAction = await this.prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        email: dto.email,
                        hash,
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                    },
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        createdAt: true,
                        updatedAt: true,
                    }
                });

                const membership = await tx.membership.create({
                    data: {
                        userId: user.id,
                        organizationId: FloatId,
                        role: UserRole.PATIENT,
                        status: MembershipStatus.ACTIVE,
                        activatedAt: new Date(),
                    },
                    select: { id: true }
                })

                return { user, membership }
            },
                {
                    maxWait: 5000,
                    timeout: 10000,
                }
            )

            const tokens = await this.signToken(
                userAction.user.id,
                userAction.user.email,
                [{ organizationId: FloatId }],
            );

            await this.saveRefreshToken(userAction.user.id, tokens.jti, tokens.refreshToken)

            return tokens;
        }
        catch (err) {
            if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
                throw new ForbiddenException("Credentials taken")
            }
            throw err;
        }
    }

    // admin-created accounts - doctor/nurse
    // only admin can create this
    // Problem - 15 Mar, 2026
    // if an admin tries to register,an already registered doctor in another org, as part of their org, 'create' will throw error P2002
    async staffSignUp(
        dto: CreateStaffDto,
        adminId: string, // admin id
        organizationId: string
    ) {

        const adminMembership = await this.prisma.membership.findUnique({
            select: {
                role: true,
                status: true,
            },
            where: {
                userId_organizationId: {
                    userId: adminId,
                    organizationId
                }
            }
        });

        if (!adminMembership
            || adminMembership.role !== UserRole.ADMIN
            || adminMembership.status !== MembershipStatus.ACTIVE
        ) {
            throw new ForbiddenException("You do not have permission to add staff to this organization");
        }

        const allowedRoles: UserRole[] = [UserRole.DOCTOR, UserRole.NURSE];
        if (!allowedRoles.includes(dto.role)) {
            throw new ForbiddenException("Invalid role assignment");
        }

        const hash = await argon.hash(dto.password);

        return await this.prisma.$transaction(async (tx) => {

            const user = await tx.user.upsert({
                where: { email: dto.email },
                update: {},
                create: {
                    email: dto.email,
                    hash,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                }
            });

            await tx.membership.create({
                data: {
                    userId: user.id,
                    organizationId: organizationId,
                    role: dto.role,
                    status: MembershipStatus.ACTIVE,
                }
            });

            await tx.staffProfile.upsert({
                where: { userId: user.id },
                update: {},
                create: {
                    userId: user.id,
                    licenseNumber: dto.licenseNumber,
                    isVerified: true,
                }
            })

            await tx.activityLog.create({
                data: {
                    userId: adminId,
                    organizationId: organizationId,
                    eventType: EventType.MEMBER_CREATED,
                    metadata: {
                        newUserId: user.id,
                        roleAssigned: dto.role
                    }
                }
            });

            return user;
        })
    }

    async login(dto: LoginDto) {
        // find user by email
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                lockUntil: true,
                hash: true,
                email: true,
                memberships: {
                    where: { status: MembershipStatus.ACTIVE },
                    include: { organization: true },
                },
                patient: {
                    select: {
                        id: true, organizationId: true,
                    }
                }
            }
        });

        if (!user) {
            await this.prisma.activityLog.create({
                data: {
                    eventType: EventType.AUTH_LOGIN_FAILED,
                    metadata: {
                        email: dto.email,
                        reason: "User not found",
                    }
                }
            })
            throw new ForbiddenException("Invalid Credentials");
        };

        // check if accoutn locked ?
        if (user.lockUntil && user.lockUntil > new Date()) {
            throw new ForbiddenException("Account locked. Try again later");
        }

        // check password match
        const pwMatches = await argon.verify(user.hash, dto.password);

        if (!pwMatches) {
            await this.prisma.$transaction(async (tx) => {
                const updatedUser = await tx.user.update({
                    where: { id: user.id },
                    data: { failedLoginCount: { increment: 1 } }
                });

                if (updatedUser.failedLoginCount >= 5) {
                    await tx.user.update({
                        where: { id: user.id },
                        data: { lockUntil: new Date(Date.now() + 15 * 60000) }
                    });
                }

                await tx.activityLog.create({
                    data: {
                        userId: user.id,
                        eventType: EventType.AUTH_LOGIN_FAILED,
                        metadata: {
                            reason: "Invalid Password",
                            timeStamp: new Date(),
                        }
                    }
                });
            });

            throw new ForbiddenException("Invalid Credentials");
        }

        const isPatient = user.patient && user.patient.length > 0;
        const activeMemberships = user.memberships || [];

        if (activeMemberships.length === 0 && !isPatient) {
            await this.prisma.activityLog.create({
                data: {
                    userId: user.id,
                    eventType: EventType.PE_VIOLATION_VERTICAL,
                    metadata: {
                        action: "User has no active memberships or patients links",
                        timeStamp: new Date(Date.now()).toISOString(),
                    }
                }
            });
            throw new ForbiddenException("Access Denied: Account Inactive");
        }

        return await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: user.id },
                data: { failedLoginCount: 0, lockUntil: null }
            });
            const tokens = await this.signToken(
                user.id,
                user.email,
                user.memberships
            );
            await this.saveRefreshToken(user.id, tokens.jti, tokens.refreshToken, tx);

            await tx.activityLog.create({
                data: {
                    userId: user.id,
                    eventType: EventType.AUTH_LOGIN_SUCCESS,
                    metadata: {
                        status: "success",
                        timestamp: new Date().toISOString()
                    }
                }
            });
            return {
                ...tokens,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    organizations: user.memberships.map(m => ({
                        id: m.organizationId,
                        name: m.organization.name,
                        role: m.role,
                    }))
                }
            };
        });
    }

    async logout(userId: string, jti: string) {
        return await this.prisma.$transaction(async (tx) => {
            // 1. Get all active tokens for this user
            const token = await tx.refreshToken.updateMany({
                where: {
                    id: jti,
                    userId: userId,
                    revokedAt: null,
                },
                data: {
                    revokedAt: new Date(),
                }
            });

            if (!token) {
                throw new NotFoundException("Session not found");
            }

            // 4. Audit Log
            await tx.activityLog.create({
                data: {
                    userId,
                    eventType: 'AUTH_LOGOUT',
                    metadata: { action: "User logged out" }
                }
            });
        });
    }

    // add a job queue for this later using bullMq to fire emails
    async generatePatientClaim(
        dto: CreateClaimDto,
        currentUserId: string,
    ) {
        const result = await this.prisma.$transaction(async (tx) => {

            const organization = await tx.organization.findUnique({
                where: {
                    name: dto.organizationName,
                },
                select: {
                    id: true,
                }
            });

            if (!organization) {
                throw new ForbiddenException("Invalid request")
            };

            console.log(organization)

            const patient = await tx.patient.findUnique({
                where: {
                    puid_organizationId: {
                        // puid actually
                        puid: dto.patientId,
                        organizationId: organization.id,
                    }
                },
                select: {
                    id: true,
                    userId: true,
                    organizationId: true,
                }
            });

            if (!patient) {
                console.log(patient);
                console.log(dto.patientId);
                throw new ForbiddenException("Invalid request")
            };

            if (patient.userId) {
                throw new ForbiddenException("This patient profile has already been claimed");
            }

            const existingMembership = await this.prisma.membership.findUnique({
                where: {
                    userId_organizationId: {
                        userId: currentUserId,
                        organizationId: patient.organizationId,
                    }
                }
            });

            if (existingMembership) {
                throw new ForbiddenException("You are already a member of this organization.");
            }

            return { patientId: patient.id };
        });

        // use bullmq to register a queue
        // to send out email with verification code
        const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHash = createHash('sha256').update(rawOtp).digest('hex');

        const redisKey = `otp:patient:${result.patientId}`;
        await this.redis.setWithExpiry(redisKey, otpHash, 300);

        console.log(rawOtp, otpHash, redisKey);
        // const verifySave = await this.redis.get(redisKey);
        // console.log("Did you actually save?: ", verifySave ? "YES" : "NO");

        return {
            message: "OTP generated successfully (add email verification later)",
            dev_otp: rawOtp,
        }
    }

    async validatePatientClaim(
        dto: VerifyClaimDto,
        currentUserId: string,
    ) {
        const organization = await this.prisma.organization.findUnique({
            where: { name: dto.organizationName },
            select: { id: true },
        });
        console.log("organization: ", organization);

        if (!organization) {
            throw new ForbiddenException("Invalid request");
        }

        const patient = await this.prisma.patient.findUnique({
            where: {
                puid_organizationId: {
                    puid: dto.patientId,
                    organizationId: organization.id
                }
            },
            select: {
                id: true,
            }
        });

        console.log("patient: ", patient);

        if (!patient) {
            throw new ForbiddenException("Invalid request");
        }

        const redisKey = `otp:patient:${patient.id}`;

        const storedHash = await this.redis.get(redisKey);
        if (!storedHash) {
            throw new ForbiddenException("OTP has expired or does not exist.");
        }

        const incomingHash = createHash('sha256').update(dto.claimCode).digest('hex');
        console.log(incomingHash, dto.claimCode);
        if (incomingHash !== storedHash) {
            throw new ForbiddenException('Invalid OTP.');
        }

        console.log(redisKey, storedHash, dto.claimCode, incomingHash);

        await this.prisma.$transaction(async (tx) => {
            // link user to patient (patient => userId)
            const patientCheck = await tx.patient.findUnique({
                where: { id: patient.id },
                select: { userId: true, organizationId: true },
            });

            if (!patientCheck) {
                throw new ForbiddenException("Invalid Request");
            }

            if (patientCheck.userId) {
                throw new ForbiddenException("This patient profile has been already claimed");
            }

            const existingMembership = await tx.membership.findUnique({
                where: {
                    userId_organizationId: {
                        userId: currentUserId,
                        organizationId: patientCheck.organizationId,
                    }
                }
            });

            if (existingMembership) {
                throw new ForbiddenException("You are already linked to this organization.");
            }

            await tx.patient.update({
                where: { id: patient.id },
                data: { userId: currentUserId },
            })

            await tx.membership.create({
                data: {
                    userId: currentUserId,
                    organizationId: patientCheck.organizationId,
                    role: UserRole.PATIENT,
                    status: MembershipStatus.ACTIVE,
                    activatedAt: new Date(),
                }
            })
        });

        await this.redis.del(redisKey);

        return {
            success: true,
            message: "Account successfully linked!"
        };
    }

}
