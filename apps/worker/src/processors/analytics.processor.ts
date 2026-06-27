import { Worker, type Job } from 'bullmq';
import { PrismaClient } from '@ensocial/database';
import { decrypt } from '../utils/crypto';

const db = new PrismaClient();

interface SyncAnalyticsJobData {
  accountId: string;
  workspaceId: string;
}

async function fetchFacebookInsights(pageId: string, accessToken: string) {
  const since = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
  const res = await fetch(
    `https://graph.facebook.com/v20.0/${pageId}/insights?metric=page_impressions,page_reach,page_followers_count&period=day&since=${since}&access_token=${accessToken}`,
  );
  const data = await res.json() as { data?: Array<{ name: string; values: Array<{ value: number; end_time: string }> }> };
  return data.data ?? [];
}

async function fetchTwitterMetrics(userId: string, accessToken: string) {
  const res = await fetch(
    `https://api.twitter.com/2/users/${userId}?user.fields=public_metrics`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  const data = await res.json() as { data?: { public_metrics?: { followers_count: number } } };
  return data.data?.public_metrics ?? { followers_count: 0 };
}

async function processSyncAnalytics(job: Job<SyncAnalyticsJobData>) {
  const { accountId } = job.data;

  const account = await db.socialAccount.findUnique({ where: { id: accountId } });
  if (!account) return { accountId, skipped: true };

  const token = decrypt(account.accessToken);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    if (account.platform === 'FACEBOOK') {
      const insights = await fetchFacebookInsights(account.platformId, token);

      const followersInsight = insights.find((i) => i.name === 'page_followers_count');
      const reachInsight = insights.find((i) => i.name === 'page_reach');

      const followersCount = followersInsight?.values[followersInsight.values.length - 1]?.value ?? account.followersCount;
      const dailyReach = reachInsight?.values[reachInsight.values.length - 1]?.value ?? 0;

      await db.socialAccount.update({
        where: { id: accountId },
        data: { followersCount },
      });

      await db.accountAnalytics.upsert({
        where: { socialAccountId_date: { socialAccountId: accountId, date: today } },
        create: { socialAccountId: accountId, date: today, followersCount, reach: dailyReach },
        update: { followersCount, reach: dailyReach },
      });
    } else if (account.platform === 'TWITTER') {
      const metrics = await fetchTwitterMetrics(account.platformId, token);

      await db.socialAccount.update({
        where: { id: accountId },
        data: { followersCount: metrics.followers_count },
      });

      await db.accountAnalytics.upsert({
        where: { socialAccountId_date: { socialAccountId: accountId, date: today } },
        create: { socialAccountId: accountId, date: today, followersCount: metrics.followers_count },
        update: { followersCount: metrics.followers_count },
      });
    }

    return { accountId, platform: account.platform, synced: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Analytics sync failed for ${accountId}: ${message}`);
    return { accountId, platform: account.platform, synced: false, error: message };
  }
}

export function createAnalyticsWorker(redisUrl: string) {
  const worker = new Worker<SyncAnalyticsJobData>('analytics', processSyncAnalytics, {
    connection: { url: redisUrl },
    concurrency: 10,
  });

  worker.on('completed', (job, result) => {
    console.log(`[Analytics] Job ${job.id} completed`, result);
  });

  worker.on('failed', (job, error) => {
    console.error(`[Analytics] Job ${job?.id} failed`, error.message);
  });

  return worker;
}
