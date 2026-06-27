import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseSocialConnector, type OAuthTokens, type PlatformProfile, type TokenSet } from './base.connector';

const GRAPH_API = 'https://graph.facebook.com/v20.0';

@Injectable()
export class InstagramConnector extends BaseSocialConnector {
  readonly platform = 'INSTAGRAM';

  private readonly appId: string;
  private readonly appSecret: string;
  private readonly callbackUrl: string;

  constructor(config: ConfigService) {
    super();
    this.appId = config.get<string>('social.facebook.appId') ?? '';
    this.appSecret = config.get<string>('social.facebook.appSecret') ?? '';
    this.callbackUrl = `${config.get<string>('apiUrl')}/api/social/callback/instagram`;
  }

  getAuthUrl(workspaceId: string, userId: string): string {
    const state = this.encodeState(workspaceId, userId);
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.callbackUrl,
      scope: 'instagram_basic,instagram_content_publish,instagram_manage_insights,pages_show_list',
      state,
      response_type: 'code',
    });
    return `https://www.facebook.com/v20.0/dialog/oauth?${params.toString()}`;
  }

  async exchangeCode(code: string, state: string): Promise<OAuthTokens> {
    const params = new URLSearchParams({
      client_id: this.appId,
      client_secret: this.appSecret,
      redirect_uri: this.callbackUrl,
      code,
    });

    const res = await fetch(`${GRAPH_API}/oauth/access_token?${params.toString()}`);
    const tokenData = await res.json() as { access_token: string };

    // Get long-lived token
    const llRes = await fetch(
      `${GRAPH_API}/oauth/access_token?grant_type=fb_exchange_token&client_id=${this.appId}&client_secret=${this.appSecret}&fb_exchange_token=${tokenData.access_token}`,
    );
    const llData = await llRes.json() as { access_token: string; expires_in?: number };

    // Get Instagram Business Account via Facebook Pages
    const pagesRes = await fetch(
      `${GRAPH_API}/me/accounts?fields=instagram_business_account{id,name,username,profile_picture_url,followers_count}&access_token=${llData.access_token}`,
    );
    const pagesData = await pagesRes.json() as {
      data: Array<{ instagram_business_account?: { id: string; name: string; username: string; profile_picture_url?: string; followers_count?: number } }>;
    };

    const igAccount = pagesData.data.find((p) => p.instagram_business_account)?.instagram_business_account;
    if (!igAccount) throw new Error('No Instagram Business Account found');

    this.decodeState(state);

    return {
      accessToken: llData.access_token,
      expiresAt: llData.expires_in ? new Date(Date.now() + llData.expires_in * 1000) : undefined,
      profile: {
        platformId: igAccount.id,
        name: igAccount.name,
        username: `@${igAccount.username}`,
        profilePicture: igAccount.profile_picture_url,
        followersCount: igAccount.followers_count,
      },
    };
  }

  async refreshToken(_refreshToken: string): Promise<TokenSet> {
    throw new Error('Instagram tokens must be reconnected when expired');
  }

  async getProfile(accessToken: string): Promise<PlatformProfile> {
    const res = await fetch(
      `${GRAPH_API}/me?fields=id,name,username,profile_picture_url,followers_count&access_token=${accessToken}`,
    );
    const data = await res.json() as { id: string; name: string; username?: string; profile_picture_url?: string; followers_count?: number };
    return {
      platformId: data.id,
      name: data.name,
      username: data.username ? `@${data.username}` : undefined,
      profilePicture: data.profile_picture_url,
      followersCount: data.followers_count,
    };
  }
}
