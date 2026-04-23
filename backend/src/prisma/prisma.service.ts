import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg'
// import { PrismaClient } from '../generated/prisma/client';
// import { PrismaClient } from '@prisma/client';
import { PrismaClient } from '../generated/prisma/client.js';
import 'dotenv/config'

@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
        const adapter = new PrismaPg({
            connectionString: process.env.DATABASE_URL as string,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 30000,
        });
        super({
            adapter,
            log: ['query', 'error', 'warn'],
        });
    }
}
