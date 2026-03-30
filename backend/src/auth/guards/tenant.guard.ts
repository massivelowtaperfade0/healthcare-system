// Purpose :
// step 1: check for organization header in request
// step 2: verify it against org[] in access token
// step 3: verify if membership status is active
// step 4: if all above conditions are true than create a new Organization Context

import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { EventType } from "src/generated/prisma/enums";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class OrganizationGuard implements CanActivate {
    constructor(
        private prisma: PrismaService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // step 1
        const targetOrgId = request.headers['x-org-id'];

        if (!targetOrgId) {
            throw new BadRequestException("Organization context (x-org-id) is missing");
        }

        // step 2
        const hasAccess = user.orgs.includes(targetOrgId);
        if (!hasAccess) {
            await this.prisma.activityLog.create({
                data: {
                    userId: user.sub,
                    eventType: EventType.PE_VIOLATION_HORIZONTAL,
                    metadata: {
                        action: "Attempt to spoof organization request, which the user is not part of",
                        timeStamp: new Date(Date.now()).toISOString()
                    }
                }
            });
            throw new ForbiddenException("You do not belong to this organization");
        }

        // step 3
        const membership = await this.prisma.membership.findUnique({
            where: {
                userId_organizationId: {
                    userId: user.sub,
                    organizationId: targetOrgId,
                },
            },
            select: { role: true, status: true }
        });

        if (!membership || membership.status !== 'ACTIVE') {
            await this.prisma.activityLog.create({
                data: {
                    userId: user.sub,
                    organizationId: targetOrgId,
                    eventType: EventType.PE_VIOLATION_VERTICAL,
                    metadata: {
                        action: "Attempt to spoof organization request as an inactive user",
                        attemptedOrgId: targetOrgId,
                        timeStamp: new Date(Date.now()).toISOString()
                    }
                }
            });
            throw new ForbiddenException('Access denied to this organization');
        }

        // step 4
        request.organizationContext = {
            orgId: targetOrgId,
            role: membership.role,
            userId: user.sub,
        }

        return true;
    }
}