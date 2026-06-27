import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { DatabaseService } from '../../database/database.service';
import { RedisService } from '../../redis/redis.service';

const PUBLISHING_QUEUE = 'publishing';

@Injectable()
export class PublishingService {
  private readonly logger = new Logger(PublishingService.name);
  private readonly queue: Queue;

  constructor(
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
  ) {
    this.queue = new Queue(PUBLISHING_QUEUE, {
      connection: {
    host: process.env.REDIS_HOST ?? 'redis',
    port: Number(process.env.REDIS_PORT ?? 6379),
  },
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    });
  }

  async schedulePost(postId: string, workspaceId: string) {
    const post = await this.db.post.findFirst({
      where: { id: postId, workspaceId },
      include: { socialAccounts: true },
    });

    if (!post) throw new NotFoundException('Post not found');
    if (!post.scheduledAt) throw new BadRequestException('Post has no scheduled time');
    if (!['DRAFT', 'APPROVED'].includes(post.status)) {
      throw new BadRequestException('Only draft or approved posts can be scheduled');
    }

    const delay = post.scheduledAt.getTime() - Date.now();
    if (delay < 0) throw new BadRequestException('Scheduled time is in the past');

    const job = await this.queue.add(
      'publish-post',
      { postId, workspaceId },
      { delay, jobId: `post:${postId}` },
    );

    await this.db.post.update({
      where: { id: postId },
      data: { status: 'SCHEDULED' as never },
    });

    this.logger.log(`Post ${postId} scheduled, job ${job.id}, delay ${delay}ms`);
    return { message: 'Post scheduled', jobId: job.id, scheduledAt: post.scheduledAt };
  }

  async publishNow(postId: string, workspaceId: string) {
    const post = await this.db.post.findFirst({
      where: { id: postId, workspaceId },
    });

    if (!post) throw new NotFoundException('Post not found');
    if (!['DRAFT', 'APPROVED', 'SCHEDULED'].includes(post.status)) {
      throw new BadRequestException('Post cannot be published in current status');
    }

    // Remove any existing scheduled job
    const existing = await this.queue.getJob(`post:${postId}`);
    if (existing) await existing.remove();

    const job = await this.queue.add(
      'publish-post',
      { postId, workspaceId },
      { jobId: `post:${postId}:now` },
    );

    await this.db.post.update({
      where: { id: postId },
      data: { status: 'PUBLISHING' as never },
    });

    return { message: 'Publishing started', jobId: job.id };
  }

  async cancelScheduledPost(postId: string, workspaceId: string) {
    const post = await this.db.post.findFirst({
      where: { id: postId, workspaceId, status: 'SCHEDULED' },
    });
    if (!post) throw new NotFoundException('Scheduled post not found');

    const job = await this.queue.getJob(`post:${postId}`);
    if (job) await job.remove();

    await this.db.post.update({
      where: { id: postId },
      data: { status: 'DRAFT' as never },
    });

    return { message: 'Schedule cancelled' };
  }

  async retryPost(postId: string, workspaceId: string) {
    const post = await this.db.post.findFirst({
      where: { id: postId, workspaceId, status: 'FAILED' },
    });
    if (!post) throw new NotFoundException('Failed post not found');

    const job = await this.queue.add(
      'publish-post',
      { postId, workspaceId },
      { jobId: `post:${postId}:retry:${Date.now()}` },
    );

    await this.db.post.update({
      where: { id: postId },
      data: { status: 'PUBLISHING' as never },
    });

    return { message: 'Retry queued', jobId: job.id };
  }

  async getQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
    ]);
    return { waiting, active, completed, failed, delayed };
  }
}
