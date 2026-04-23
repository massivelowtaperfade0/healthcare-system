import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy{
    private redisClient: Redis;

    onModuleInit() {
        this.redisClient = new Redis({
            host: 'redis', // use localhost if not using docker
            port: 6379,
        });
    }

    onModuleDestroy() {
        this.redisClient.disconnect();
    }

    async hGetAll(
        key: string,
    ): Promise<any> {
        return await this.redisClient.hgetall(key)
    }

    async hSet(
        key: string,
        membership: string,
    ): Promise<void> {
        await this.redisClient.hset(key, membership)
    }

    async expire(
        key: string,
        ttlSeconds: number
    ) {
        await this.redisClient.expire(key, ttlSeconds);
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
