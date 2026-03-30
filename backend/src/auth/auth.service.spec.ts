jest.mock('../prisma/prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    activityLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) =>
      callback({
        user: {
          update: jest.fn().mockResolvedValue({
          failedLoginCount: 1, // 👈 critical
         }),
        },
      }),
    ),
  })),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import {PrismaService} from '../prisma/prisma.service'
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        ConfigService,
        PrismaService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest
              .fn()
              .mockResolvedValueOnce('access-token')
              .mockResolvedValueOnce('refresh-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return tokens on successful login', async () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };

    (prisma as any).activityLog.create.mockResolvedValue({});
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      hash: await argon.hash('password123'),
      memberships: [{
        status: 'ACTIVE',
      }],
    });

    const result = await service.login(loginDto);

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
  });

  it('should throw ForbiddenException if password is wrong', async () => {
    (prisma as any).activityLog.create.mockResolvedValue({});
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-123',
      hash: await argon.hash('correct-password'),
    });

    await expect(
      service.login({ email: 'test@example.com', password: 'wrong-password' })
    ).rejects.toThrow('Invalid Credentials');
  })

});
