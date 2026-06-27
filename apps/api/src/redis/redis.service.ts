import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(config: ConfigService) {
    super(config.get<string>('redis.url') ?? 'redis://localhost:6379', {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });
  }

  async onModuleInit() {
    await this.connect();
    this.logger.log('Redis connected');
  }

  async onModuleDestroy() {
    await this.quit();
    this.logger.log('Redis disconnected');
  }
}
