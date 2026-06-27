import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { decrypt } from '../../common/utils/crypto';

interface ReplyDto {
  message: string;
  attachments?: string[];
}

@Injectable()
export class InboxService {
  constructor(private readonly db: DatabaseService) {}

  async getConversations(workspaceId: string, page = 1, limit = 30) {
    // Inbox aggregates comments, DMs, and mentions from connected platforms.
    // In production, these are synced by the analytics worker from each platform API.
    // For now, we surface the structure and placeholder for incoming messages.

    const accounts = await this.db.socialAccount.findMany({
      where: { workspaceId, isActive: true },
      select: { id: true, platform: true, name: true, avatar: true },
    });

    // Return account list with zero-state for now.
    // The worker will populate inbox_message table (future Prisma migration).
    return {
      accounts,
      conversations: [],
      total: 0,
      page,
      pages: 0,
      message: 'Inbox syncs automatically. Check back after connecting social accounts.',
    };
  }

  async syncInboxForAccount(accountId: string) {
    const account = await this.db.socialAccount.findUniqueOrThrow({
      where: { id: accountId },
    });

    const _token = decrypt(account.accessToken);
    // Platform-specific inbox sync logic goes in the worker processor.
    // This triggers the worker queue.
    return { accountId, platform: account.platform, status: 'sync_queued' };
  }
}
