import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { EventType } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwt: JwtService,
        private config: ConfigService,
        private prisma: PrismaService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        const secondaryTokenRetrieval = this.extractTokenFromHeader(request);
        // const token = this.extractToken(request);
        const primaryTokenRetrival = request.cookies?.['access_token'];

        const token = primaryTokenRetrival ?? secondaryTokenRetrieval

        if (!token) {
            throw new UnauthorizedException('No token');
        }

        try {
            const payload = await this.jwt.verifyAsync(token, {
                secret: this.config.get('ACCESS_TOKEN')
            });

            const session = await this.prisma.refreshToken.findUnique({
                where: { id: payload.jti },
                select: { revokedAt: true },
            });

            if (!session || session.revokedAt) {

                const orgIds: string[] = payload.orgs || [];
                const logData = orgIds.map(orgId => ({
                    userId: payload.sub,
                    organizationId: orgId,
                    eventType: EventType.AUTH_LOGIN_FAILED,
                    metadata: { action: "Revoked token re-use detected" }
                }));

                if (logData.length > 0) {
                    await this.prisma.activityLog.createMany({ data: logData });
                } else {
                    await this.prisma.activityLog.create({
                        data: {
                            userId: payload.sub,
                            eventType: EventType.AUTH_LOGIN_FAILED,
                            metadata: { reason: "Revoked token re-use - No Orgs" }
                        }
                    })
                }
                throw new UnauthorizedException('Invalid Session');
            }

            request['user'] = payload;
        }
        catch (err) {
            console.error(err.name);

            if (err.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Token expired');
            }
            throw new UnauthorizedException('Invalid token');
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}

// console.log('--- JWT DEBUG START ---');
// console.log('Token Received:', token ? 'Yes (Length: ' + token.length + ')' : 'No');
// console.log('Secret used for verify:', this.config.get('ACCESS_TOKEN'));
// console.log('Error Name:', err.name);
// console.log('Error Message:', err.message);
// console.log('--- JWT DEBUG END ---');


// private extractToken(request: Request): string | undefined {
//     console.log('Cookies', request.cookies);
//     return request.cookies?.['access_token'] || request.headers.authorization?.split(' ')[1];
// }