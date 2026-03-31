import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { catchError, Observable, throwError } from "rxjs";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ViolationLoggingInterceptor implements NestInterceptor {
    constructor(
        private prisma: PrismaService 
    ) {}

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();

        return next.handle().pipe(
            catchError((err) => {
                if (request.loggingContext && request.user) {
                    const { type, message } = request.loggingContext;
                    const user = request.user;
                    const targetOrgId = request.headers['x-org-id'];

                    this.prisma.activityLog.create({
                        data: {
                            userId: user.sub,
                            organizationId: targetOrgId,
                            eventType: type,
                            metadata: {
                                action: message,
                                timeStamp: new Date().toISOString(),
                            }
                        }
                    }).catch (logErr => {
                        console.error("Failed to write violation log to DB: ", logErr);
                    });
                }

                return throwError(() => err);
            })
        )
    }
}