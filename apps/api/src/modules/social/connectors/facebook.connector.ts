import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseSocialConnector, type OAuthTokens, type PlatformProfile, type TokenSet } from './base.connector';

const GRAPH_API = 'https://graph.facebook.com/v20.0';
const OAUTH_URL = 'https://www.facebook.com/v20.0/dialog/oauth';
const TOKEN_URL = `${GRAPH_API}/oauth/access_token`;

@Injectable()
export class FacebookConnector extends BaseSocialConnector {
  readonly platform = 'FACEBOOK';

  private readonly appId: string;
  private readonly appSecret: string;
  private readonly callbackUrl: string;

  constructor(config: ConfigService) {
    super();
    this.appId = config.get<string>('social.facebook.appId') ?? '';
    this.appSecret = config.get<string>('social.facebook.appSecret') ?? '';
    this.callbackUrl = `${config.get<string>('apiUrl')}/api/social/callback/facebook`;
  }

  getAuthUrl(workspaceId: string, userId: string): string {
    const state = this.encodeState(workspaceId, userId);
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.callbackUrl,
      scope: 'pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish,read_insights',
      state,
      response_type: 'code',
    });
    return `${OAUTH_URL}?${params.toString()}`;
  }

  async exchangeCode(code: string, state: string): Promise<OAuthTokens> {
    const params = new URLSearchParams({
      client_id: this.appId,
      client_secret: this.appSecret,
      redirect_uri: this.callbackUrl,
      code,
    });

    const res = await fetch(`${TOKEN_URL}?${params.toString()}`);
    const tokenData = await res.json() as { access_token: string; expires_in?: number };

    // Exchange for long-lived token
    const llParams = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: this.appId,
      client_secret: this.appSecret,
      fb_exchange_token: tokenData.access_token,
    });
    const llRes = await fetch(`${TOKEN_URL}?${llParams.toString()}`);
    const llData = await llRes.json() as { access_token: string; expires_in?: number };

    const profile = await this.getProfile(llData.access_token);
    const expiresAt = llData.expires_in
      ? new Date(Date.now() + llData.expires_in * 1000)
      : undefined;

    this.decodeState(state); // validate

    return { accessToken: llData.access_token, expiresAt, profile };
  }

  async refreshToken(_refreshToken: string): Promise<TokenSet> {
    // Facebook long-lived tokens are refreshed by re-exchanging
    throw new Error('Facebook tokens must be reconnected when expired');
  }

  async getProfile(accessToken: string): Promise<PlatformProfile> {
    const res = await fetch(
      `${GRAPH_API}/me?fields=id,name,picture&access_token=${accessToken}`,
    );
    const data = await res.json() as { id: string; name: string; picture?: { data?: { url?: string } } };
    return {
      platformId: data.id,
      name: data.name,
      profilePicture: data.picture?.data?.url,
    };
  }

  async getPages(accessToken: string) {
    const res = await fetch(
      `${GRAPH_API}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${accessToken}`,
    );
    return res.json() as Promise<{ data: Array<{ id: string; name: string; access_token: string; instagram_business_account?: { id: string } }> }>;
  }
}
