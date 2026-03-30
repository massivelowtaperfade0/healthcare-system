import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './guards/auth.guard';
import { RedisService } from 'src/redis/redis.service';

@Global()
@Module({
  imports: [
    JwtModule.register({}),
    PrismaModule,
    ConfigModule,
    PassportModule
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, PrismaService, RedisService, ConfigService],
  exports: [AuthService, AuthGuard, RedisService, JwtModule]
})
export class AuthModule {}
