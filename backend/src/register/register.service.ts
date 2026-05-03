import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SetUpOrganizationDto } from './dto/setup.dto';
import * as argon from 'argon2'
import { MembershipStatus, UserRole } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class RegisterService {
    constructor(
        private prisma: PrismaService,
        private auth: AuthService
    ) { }

    async setUpOrganization(dto: SetUpOrganizationDto) {

        return await this.prisma.$transaction(async (tx) => {

            const organization = await tx.organization.create({
                data: {
                    name: dto.organization,
                    city: dto.city,
                    state: dto.state,
                    country: dto.country
                },
                select: {
                    id: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });

            const hash = await argon.hash(dto.password);

            const admin = await tx.user.create({
                data: {
                    email: dto.email,
                    hash,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    memberships: {
                        create: {
                            organizationId: organization.id,
                            role: UserRole.ADMIN,
                            status: MembershipStatus.ACTIVE,
                        },
                    }
                },
                include: {
                    memberships: {
                        include: {
                            organization: true
                        }
                    }
                },
            });

            const tokens = await this.auth.signToken(
                admin.id,
                admin.email,
                admin.memberships,
            )

            const tokenHash = await argon.hash(tokens.refreshToken);

            await tx.refreshToken.create({
                data: {
                    tokenHash,
                    userId: admin.id,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                }
            });

            return tokens;
        })
    }
}
