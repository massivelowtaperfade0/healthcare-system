import { ForbiddenException, Injectable } from '@nestjs/common';
import { EventType, MembershipStatus, UserRole } from '../generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(
        private prisma: PrismaService
    ) { }

    async failedLoginCount(
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
}
