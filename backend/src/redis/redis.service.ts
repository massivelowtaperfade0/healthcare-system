import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy{
    private redisClient: Redis;

    onModuleInit() {
        this.redisClient = new Redis({
            host: 'localhost',
            port: 6379,
        });
    }

    onModuleDestroy() {
        this.redisClient.disconnect();
    }

    async setWithExpiry(
        key: string,
        value: string,
        ttlSeconds: number
    ): Promise<void>{
        await this.redisClient.set(key, value, 'EX', ttlSeconds);
    }

    async get(
        key: string
    ): Promise<string | null> {
        return await this.redisClient.get(key);
    }

    async del(
        key: string
    ): Promise<void> {
        await this.redisClient.del(key);
    }
}
