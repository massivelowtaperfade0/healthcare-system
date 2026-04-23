// Purpose :
// step 1: check for organization header in request
// step 2: verify it against org[] in access token
// step 3: verify if membership status is active
// step 4: if all above conditions are true than create a new Organization Context

import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { EventType, MembershipStatus } from "../../generated/prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.service";

@Injectable()
export class OrganizationGuard implements CanActivate {
    constructor(
        private prisma: PrismaService,
        private redis: RedisService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // step 1
        const targetOrgId = request.headers['x-org-id'] as string;

        if (!targetOrgId) {
            throw new BadRequestException("Organization context (x-org-id) is missing");
        }

        // step 2
        const hasAccess = Array.isArray(user.orgs) && user.orgs.includes(targetOrgId);
        if (!hasAccess) {
            this.flagViolation(request, "Attempt to spoof organiztion request, which user is not part of")
            // await this.prisma.activityLog.create({
            //     data: {
            //         userId: user.sub,
            //         eventType: EventType.PE_VIOLATION_HORIZONTAL,
            //         metadata: {
            //             action: "Attempt to spoof organization request, which the user is not part of",
            //             timeStamp: new Date(Date.now()).toISOString()
            //         }
            //     }
            // });
            throw new ForbiddenException("You do not belong to this organization");
        }

        const cacheKey = `user:${user.sub}:org:${targetOrgId}`;


        // step 3
        let membership = await this.redis.hGetAll(cacheKey);

        if (!membership || Object.keys(membership).length === 0) {
            const dbMembership = await this.prisma.membership.findUnique({
                where: {
                    userId_organizationId: {
                        userId: user.sub,
                        organizationId: targetOrgId,
                    },
                },
                select: { role: true, status: true }
            });

            if (!dbMembership) {
                this.flagViolation(request, "Membership record missing in DB");
                throw new ForbiddenException("Access denied to this organization");
            }

            membership = {
                role: dbMembership.role,
                status: dbMembership.status,
            };

            await this.redis.hSet(cacheKey, membership);
            await this.redis.expire(cacheKey, 900);

            if (membership.status !== MembershipStatus.ACTIVE) {
                this.flagViolation(request, "Attempt to access with inactive membership")
                throw new ForbiddenException('Access denied to this organization');
            }

        }


        // step 4
        request.organizationContext = {
            orgId: targetOrgId,
            role: membership.role,
            userId: user.sub,
        }

        return true;
    }

    private flagViolation(request: any, message: string) {
        request.loggingContext = {
            type: EventType.PE_VIOLATION_VERTICAL,
            message,
        }
    }

}
// const membership = await this.prisma.membership.findUnique({
//     where: {
//         userId_organizationId: {
//             userId: user.sub,
//             organizationId: targetOrgId,
//         },
//     },
//     select: { role: true, status: true }
// });

// if (!membership || membership.status !== MembershipStatus.ACTIVE) {
//     await this.prisma.activityLog.create({
//         data: {
//             userId: user.sub,
//             organizationId: targetOrgId,
//             eventType: EventType.PE_VIOLATION_VERTICAL,
//             metadata: {
//                 action: "Attempt to spoof organization request as an inactive user",
//                 attemptedOrgId: targetOrgId,
//                 timeStamp: new Date(Date.now()).toISOString()
//             }
//         }
//     });
//     throw new ForbiddenException('Access denied to this organization');
// }