import { Worker, type Job } from 'bullmq';
import { PrismaClient } from '@ensocial/database';
import { decrypt } from '../utils/crypto';

const db = new PrismaClient();

interface PublishJobData {
  postId: string;
  workspaceId: string;
}

async function publishToFacebook(
  pageId: string,
  accessToken: string,
  content: string,
  mediaUrls: string[],
): Promise<string> {
  const body: Record<string, unknown> = { message: content, access_token: accessToken };

  if (mediaUrls.length > 0) {
    // For simplicity, attach first image. Production: handle carousel and video.
    body.link = mediaUrls[0];
  }

  const res = await fetch(`https://graph.facebook.com/v20.0/${pageId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json() as { id?: string; error?: { message: string } };
  if (!res.ok || !data.id) throw new Error(data.error?.message ?? 'Facebook publish failed');
  return data.id;
}

async function publishToTwitter(
  accessToken: string,
  content: string,
): Promise<string> {
  const res = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: content.slice(0, 280) }),
  });

  const data = await res.json() as { data?: { id: string }; errors?: Array<{ message: string }> };
  if (!res.ok || !data.data) {
    throw new Error(data.errors?.[0]?.message ?? 'Twitter publish failed');
  }
  return data.data.id;
}

async function publishToLinkedIn(
  authorId: string,
  accessToken: string,
  content: string,
): Promise<string> {
  const body = {
    author: `urn:li:person:${authorId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: content },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  };

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  });

  const location = res.headers.get('x-restli-id') ?? res.headers.get('location');
  if (!res.ok || !location) throw new Error('LinkedIn publish failed');
  return location;
}

async function processPublishJob(job: Job<PublishJobData>) {
  const { postId } = job.data;

  const post = await db.post.findUnique({
    where: { id: postId },
    include: {
      socialAccounts: { include: { socialAccount: true } },
      createdBy: { select: { email: true } },
    },
  });

  if (!post) throw new Error(`Post ${postId} not found`);

  await db.post.update({ where: { id: postId }, data: { status: 'PUBLISHING' as never } });

  const results: Array<{ accountId: string; platform: string; success: boolean; platformPostId?: string; error?: string }> = [];

  for (const psa of post.socialAccounts) {
    const { socialAccount } = psa;
    const token = decrypt(socialAccount.accessToken);

    try {
      let platformPostId: string;

      switch (socialAccount.platform) {
        case 'FACEBOOK':
          platformPostId = await publishToFacebook(
            socialAccount.platformId,
            token,
            post.content,
            post.mediaUrls as string[],
          );
          break;
        case 'TWITTER':
          platformPostId = await publishToTwitter(token, post.content);
          break;
        case 'LINKEDIN':
          platformPostId = await publishToLinkedIn(socialAccount.platformId, token, post.content);
          break;
        default:
          throw new Error(`Platform ${socialAccount.platform} not yet implemented`);
      }

      await db.postSocialAccount.update({
        where: { postId_socialAccountId: { postId, socialAccountId: socialAccount.id } },
        data: { status: 'PUBLISHED' as never, platformPostId, publishedAt: new Date() },
      });

      results.push({ accountId: socialAccount.id, platform: socialAccount.platform, success: true, platformPostId });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';

      await db.postSocialAccount.update({
        where: { postId_socialAccountId: { postId, socialAccountId: socialAccount.id } },
        data: { status: 'FAILED' as never, error },
      });

      results.push({ accountId: socialAccount.id, platform: socialAccount.platform, success: false, error });
    }
  }

  const allSucceeded = results.every((r) => r.success);
  const anySucceeded = results.some((r) => r.success);

  await db.post.update({
    where: { id: postId },
    data: {
      status: (anySucceeded ? 'PUBLISHED' : 'FAILED') as never,
      publishedAt: anySucceeded ? new Date() : undefined,
    },
  });

  return { postId, results };
}

export function createPublishingWorker(redisUrl: string) {
  const worker = new Worker<PublishJobData>('publishing', processPublishJob, {
    connection: { url: redisUrl },
    concurrency: 5,
  });

  worker.on('completed', (job, result) => {
    console.log(`[Publishing] Job ${job.id} completed`, result);
  });

  worker.on('failed', (job, error) => {
    console.error(`[Publishing] Job ${job?.id} failed`, error.message);
    if (job?.data.postId) {
      void db.post.update({
        where: { id: job.data.postId },
        data: { status: 'FAILED' },
      }).catch(() => {});
    }
  });

  return worker;
}
