import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventType, MembershipStatus, UserRole } from '../generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService
    ) { }

    async getMe(userId: string, requestedOrgId?: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                memberships: {
                    where: { status: MembershipStatus.ACTIVE },
                    include: {
                        organization: {
                            select: {
                                name: true,
                                id: true,
                            }
                        }
                    }
                }
            }
        });

        if (!user) return null;

        // temporary
        let active;

        if (requestedOrgId) {
            active = user.memberships.find(m => m.organizationId === requestedOrgId);
        }

        if (!active && user.memberships.length > 0) {
            active = user.memberships[0];
        }

        return {
            id: user.id,
            email: user.email,
            activeOrg: active ? {
                id: active.organizationId,
                role: active.role,
                name: active.organization.name,
            } : null,
            orgs: user.memberships.map(m => m.organizationId)
        };
    }

    async activityLog(
        organizationId: string,
    ) {
        // const membership = await this.prisma.membership.findUnique({
        //     select: {
        //         id: true,
        //         role: true,
        //         status: true,
        //         userId: true,
        //     },
        //     where: {
        //         userId_organizationId: {
        //             userId,
        //             organizationId,
        //         }
        //     }
        // });

        // if (!membership ||
        //     membership.role !== UserRole.ADMIN ||
        //     membership.status !== MembershipStatus.ACTIVE
        // ) {
        //     await this.prisma.activityLog.create({
        //         data: {
        //             userId: membership?.userId,
        //             eventType: EventType.PE_VIOLATION_VERTICAL,
        //             metadata: {
        //                 reason: "Attempt to access activity logs by an non-admin account",
        //                 timeStamp: new Date(Date.now()).toISOString()
        //             }
        //         }
        //     })
        //     throw new ForbiddenException("Only admin can access activity logs")
        // }

        const logs = await this.prisma.activityLog.findMany({
            where: {
                organizationId: organizationId
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 30,
            select: {
                id: true,
                organizationId: true,
                userAgent: true,
                ip: true,
                userId: true,
                user: { select: { email: true } },
                metadata: true,
                eventType: true,
                createdAt: true
            }
        });

        if (!logs.length) {
            return [];
        }

        return logs;
    }

    async faileLoginCount(
        userId: string,
        organizationId: string,
    ) {
        const membership = await this.prisma.membership.findUnique({
            select: {
                id: true,
                role: true,
                status: true,
                userId: true,
                localFailedLogins: true
            },
            where: {
                userId_organizationId: {
                    userId,
                    organizationId,
                }
            }
        });

        if (!membership ||
            membership.role !== UserRole.ADMIN ||
            membership.status !== MembershipStatus.ACTIVE
        ) {
            await this.prisma.activityLog.create({
                data: {
                    userId: userId,
                    eventType: EventType.PE_VIOLATION_VERTICAL,
                    metadata: {
                        action: "Attempt to read failed counts by an non-admin account",
                        timeStamp: new Date(Date.now()).toISOString(),
                    }
                }
            })
            throw new ForbiddenException("Login with admin account to perform this action");
        }

        const failedLoginCount = membership.localFailedLogins

        return failedLoginCount;
    }

    async getAllStaff(
        organizationId: string,
        limit?: number
    ) {
        const staff = await this.prisma.membership.findMany({
            where: {
                organizationId,
                role: {
                    in: [UserRole.DOCTOR, UserRole.NURSE]
                },
            },
            select: {
                id: true,
                userId: true,
                user: {
                    select: {
                        firstName: true,
                        lastName: true,

                    },
                },
                status: true,
                role: true,
                statusChangedById: true,
                statusChangeReason: true,
            },
            orderBy: {
                activatedAt: 'desc'
            },
            take: Math.min(limit || 20, 20)
        });

        if (staff.length === 0) {
            return {
                message: "No staff added yet"
            };
        }

        return staff;
    }
}
