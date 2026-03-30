import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { OrganizationModule } from './organization/organization.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { PatientModule } from './patient/patient.module';
import { RegisterModule } from './register/register.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { StorageService } from './storage/storage.service';
import { AttachmentModule } from './attachment/attachment.module';
import { RecordModule } from './record/record.module';
import { BullModule } from '@nestjs/bullmq';
import { RedisService } from './redis/redis.service';

@Module({
  imports: [
    AuthModule, 
    PrismaModule, 
    OrganizationModule, 
    ConfigModule.forRoot({isGlobal: true}), 
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379
      }
    }),
    UserModule, 
    PatientModule, 
    RegisterModule, 
    DashboardModule, 
    AttachmentModule, 
    RecordModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, StorageService, RedisService],
})
export class AppModule {}
