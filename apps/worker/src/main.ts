import 'dotenv/config';
import { createPublishingWorker } from './processors/publishing.processor';
import { createAnalyticsWorker } from './processors/analytics.processor';

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';

async function main() {
  console.log('[Worker] Starting EnSocial background workers...');

  const publishingWorker = createPublishingWorker(REDIS_URL);
  const analyticsWorker = createAnalyticsWorker(REDIS_URL);

  console.log('[Worker] Publishing worker running (concurrency: 5)');
  console.log('[Worker] Analytics worker running (concurrency: 10)');

  async function shutdown(signal: string) {
    console.log(`[Worker] Received ${signal}, shutting down gracefully...`);
    await Promise.all([
      publishingWorker.close(),
      analyticsWorker.close(),
    ]);
    console.log('[Worker] All workers stopped');
    process.exit(0);
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

main().catch((err) => {
  console.error('[Worker] Fatal error', err);
  process.exit(1);
});
