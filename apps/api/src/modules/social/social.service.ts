import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { encrypt, decrypt } from '../../common/utils/crypto';
import { FacebookConnector } from './connectors/facebook.connector';
import { InstagramConnector } from './connectors/instagram.connector';
import { TwitterConnector } from './connectors/twitter.connector';
import { LinkedInConnector } from './connectors/linkedin.connector';
import type { BaseSocialConnector } from './connectors/base.connector';

type Platform = 'FACEBOOK' | 'INSTAGRAM' | 'TWITTER' | 'LINKEDIN' | 'TIKTOK' | 'YOUTUBE' | 'PINTEREST' | 'THREADS';

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name);

  private readonly connectors: Partial<Record<Platform, BaseSocialConnector>>;

  constructor(
    private readonly db: DatabaseService,
    private readonly facebook: FacebookConnector,
    private readonly instagram: InstagramConnector,
    private readonly twitter: TwitterConnector,
    private readonly linkedin: LinkedInConnector,
  ) {
    this.connectors = {
      FACEBOOK: facebook,
      INSTAGRAM: instagram,
      TWITTER: twitter,
      LINKEDIN: linkedin,
    };
  }

  getAuthUrl(platform: Platform, workspaceId: string, userId: string): string {
    const connector = this.getConnector(platform);
    return connector.getAuthUrl(workspaceId, userId);
  }

  async handleCallback(platform: Platform, code: string, state: string) {
    const connector = this.getConnector(platform);
    const tokens = await connector.exchangeCode(code, state);

    const { workspaceId, userId } = connector.decodeState(state);

    const existing = await this.db.socialAccount.findFirst({
      where: {
        workspaceId,
        platform: platform as never,
        platformId: tokens.profile.platformId,
      },
    });

    const data = {
      platform: platform as never,
      platformId: tokens.profile.platformId,
      name: tokens.profile.name,
      username: tokens.profile.username,
      image: tokens.profile.profilePicture,
      followersCount: tokens.profile.followersCount ?? 0,
      accessToken: encrypt(tokens.accessToken),
      refreshToken: tokens.refreshToken ? encrypt(tokens.refreshToken) : null,
      tokenExpiresAt: tokens.expiresAt,
      isActive: true,
      workspaceId,
    };

    const account = existing
      ? await this.db.socialAccount.update({ where: { id: existing.id }, data })
      : await this.db.socialAccount.create({ data });

    return this.sanitizeAccount(account);
  }

  async listAccounts(workspaceId: string) {
    const accounts = await this.db.socialAccount.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    });
    return accounts.map((a) => this.sanitizeAccount(a));
  }

  async getAccount(accountId: string, workspaceId: string) {
    const account = await this.db.socialAccount.findFirst({
      where: { id: accountId, workspaceId },
    });
    if (!account) throw new NotFoundException('Social account not found');
    return this.sanitizeAccount(account);
  }

  async refreshAccount(accountId: string, workspaceId: string) {
    const account = await this.db.socialAccount.findFirst({
      where: { id: accountId, workspaceId },
    });
    if (!account) throw new NotFoundException('Social account not found');
    if (!account.refreshToken) throw new BadRequestException('No refresh token available');

    const connector = this.getConnector(account.platform as Platform);
    const decrypted = decrypt(account.refreshToken);
    const tokens = await connector.refreshToken(decrypted);

    const updated = await this.db.socialAccount.update({
      where: { id: accountId },
      data: {
        accessToken: encrypt(tokens.accessToken),
        refreshToken: tokens.refreshToken ? encrypt(tokens.refreshToken) : account.refreshToken,
        tokenExpiresAt: tokens.expiresAt,
        isActive: true,
      },
    });

    return this.sanitizeAccount(updated);
  }

  async disconnectAccount(accountId: string, workspaceId: string) {
    const account = await this.db.socialAccount.findFirst({
      where: { id: accountId, workspaceId },
    });
    if (!account) throw new NotFoundException('Social account not found');

    await this.db.socialAccount.delete({ where: { id: accountId } });
    return { message: 'Account disconnected' };
  }

  async getDecryptedToken(accountId: string): Promise<string> {
    const account = await this.db.socialAccount.findUniqueOrThrow({ where: { id: accountId } });
    return decrypt(account.accessToken);
  }

  private getConnector(platform: Platform): BaseSocialConnector {
    const connector = this.connectors[platform];
    if (!connector) throw new BadRequestException(`Platform ${platform} not yet supported`);
    return connector;
  }

  private sanitizeAccount(account: Record<string, unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { accessToken, refreshToken, ...safe } = account as {
      accessToken: string;
      refreshToken?: string;
    } & Record<string, unknown>;
    return safe;
  }
}
