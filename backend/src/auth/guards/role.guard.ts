// Purpose :
// step 1: check for OrganizationContext in request
// step 2: verify if user role via context
// step 3: throw error if not required role
// step 4: if all above conditions are met, return true

import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "src/common/decorators/roles.decorator";
import { EventType, UserRole } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requireRoles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]
        );

        // if no roles are defined on route, let it pass
        if (!requireRoles || requireRoles.length === 0) {
            return true;
        }

        // capture request
        const request = context.switchToHttp().getRequest();

        const organizationContext = request.organizationContext;

        // check if user is part of active org
        if (!organizationContext) {
            throw new ForbiddenException("No organization context found, Did you forgot TenantGuard?");
        }

        // check what role user has
        const hasRole = requireRoles.includes(organizationContext.role);

        // throw if not one of required role
        if (!hasRole) {
            await this.prisma.activityLog.create({
                data: {
                    userId: organizationContext.userId,
                    organizationId: organizationContext.orgId,
                    eventType: EventType.PE_VIOLATION_VERTICAL,
                    metadata: {
                        requiredRoles: requireRoles,
                        actualRole: organizationContext.role,
                        path: request.url,
                        method: request.method
                    }
                }
            }).catch(err => console.error("Logging failed: ", err));
            throw new ForbiddenException(`Insufficient permissions. Required: ${requireRoles}`);
        }

        // if all above checks negative return trye
        return true;

    }
}