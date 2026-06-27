import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { DatabaseService } from '../../database/database.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly queue: Queue;

  constructor(
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
  ) {
    const redisUrl = new URL(process.env.REDIS_URL ?? 'redis://redis:6379');
    this.queue = new Queue('analytics', {
      connection: {
        host: redisUrl.hostname,
        port: Number(redisUrl.port) || 6379,
        password: redisUrl.password || undefined,
      },
    });
  }

  async getOverview(workspaceId: string, period: '7d' | '30d' | '90d' = '30d') {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [totalPosts, publishedPosts, scheduledPosts, accounts, analytics] = await Promise.all([
      this.db.post.count({ where: { workspaceId } }),
      this.db.post.count({ where: { workspaceId, status: 'PUBLISHED', publishedAt: { gte: since } } }),
      this.db.post.count({ where: { workspaceId, status: 'SCHEDULED' } }),
      this.db.socialAccount.count({ where: { workspaceId, isActive: true } }),
      this.db.postAnalytics.findMany({
        where: { post: { workspaceId }, createdAt: { gte: since } },
        select: { likes: true, comments: true, shares: true, reach: true, impressions: true, clicks: true },
      }),
    ]);

    const totalReach = analytics.reduce((sum, a) => sum + (a.reach ?? 0), 0);
    const totalImpressions = analytics.reduce((sum, a) => sum + (a.impressions ?? 0), 0);
    const totalEngagements = analytics.reduce(
      (sum, a) => sum + (a.likes ?? 0) + (a.comments ?? 0) + (a.shares ?? 0),
      0,
    );
    const totalClicks = analytics.reduce((sum, a) => sum + (a.clicks ?? 0), 0);
    const avgEngagementRate =
      totalImpressions > 0 ? ((totalEngagements / totalImpressions) * 100).toFixed(2) : '0';

    return {
      period,
      totalPosts,
      publishedPosts,
      scheduledPosts,
      connectedAccounts: accounts,
      reach: totalReach,
      impressions: totalImpressions,
      engagements: totalEngagements,
      clicks: totalClicks,
      avgEngagementRate: parseFloat(avgEngagementRate),
    };
  }

  async getPostPerformance(workspaceId: string, page = 1, limit = 20) {
    const [posts, total] = await Promise.all([
      this.db.post.findMany({
        where: { workspaceId, status: 'PUBLISHED' },
        include: {
          analytics: true,
          socialAccounts: { include: { socialAccount: true } },
          createdBy: { select: { id: true, name: true, image: true } },
        },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.db.post.count({ where: { workspaceId, status: 'PUBLISHED' } }),
    ]);

    return { posts, total, page, pages: Math.ceil(total / limit) };
  }

  async getAccountGrowth(workspaceId: string, period: '7d' | '30d' | '90d' = '30d') {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return this.db.accountAnalytics.findMany({
      where: {
        socialAccount: { workspaceId },
        date: { gte: since },
      },
      include: { socialAccount: { select: { platform: true, name: true, image: true } } },
      orderBy: { date: 'asc' },
    });
  }

  async triggerSync(workspaceId: string) {
    const accounts = await this.db.socialAccount.findMany({
      where: { workspaceId, isActive: true },
      select: { id: true, platform: true },
    });

    const jobs = accounts.map((account) =>
      this.queue.add('sync-analytics', { accountId: account.id, workspaceId }),
    );

    await Promise.all(jobs);
    this.logger.log(`Queued analytics sync for ${accounts.length} accounts in workspace ${workspaceId}`);

    return { message: `Syncing ${accounts.length} accounts`, count: accounts.length };
  }
}
