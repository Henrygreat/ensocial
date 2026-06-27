import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { JwtAuthGuard } from './common/guards/jwt.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

import { AuthModule } from './modules/auth/auth.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { SocialModule } from './modules/social/social.module';
import { ContentModule } from './modules/content/content.module';
import { PublishingModule } from './modules/publishing/publishing.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AiModule } from './modules/ai/ai.module';
import { BillingModule } from './modules/billing/billing.module';
import { InboxModule } from './modules/inbox/inbox.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SearchModule } from './modules/search/search.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['../../.env', '.env'],
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    EventEmitterModule.forRoot({ wildcard: false, delimiter: '.', maxListeners: 20 }),
    DatabaseModule,
    RedisModule,
    AuthModule,
    OrganizationsModule,
    SocialModule,
    ContentModule,
    PublishingModule,
    AnalyticsModule,
    AiModule,
    BillingModule,
    InboxModule,
    NotificationsModule,
    SearchModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
