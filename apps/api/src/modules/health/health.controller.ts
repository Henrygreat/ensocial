import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DatabaseService } from '../../database/database.service';
import { RedisService } from '../../redis/redis.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('health')
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check' })
  async check() {
    const checks: Record<string, 'ok' | 'error'> = {};

    try {
      await this.db.$queryRaw`SELECT 1`;
      checks.database = 'ok';
    } catch {
      checks.database = 'error';
    }

    try {
      await this.redis.ping();
      checks.redis = 'ok';
    } catch {
      checks.redis = 'error';
    }

    const healthy = Object.values(checks).every((v) => v === 'ok');

    return {
      status: healthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    };
  }
}
