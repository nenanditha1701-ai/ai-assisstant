import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.redisClient = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
    });
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }

  async set(key: string, value: any, ttl?: number) {
    const stringValue = JSON.stringify(value);
    if (ttl) {
      await this.redisClient.set(key, stringValue, 'EX', ttl);
    } else {
      await this.redisClient.set(key, stringValue);
    }
  }

  async get(key: string): Promise<any> {
    const value = await this.redisClient.get(key);
    return value ? JSON.parse(value) : null;
  }

  async del(key: string) {
    await this.redisClient.del(key);
  }
}
