import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseSocialConnector, type OAuthTokens, type PlatformProfile, type TokenSet } from './base.connector';

const OAUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const ME_URL = 'https://api.linkedin.com/v2/userinfo';

@Injectable()
export class LinkedInConnector extends BaseSocialConnector {
  readonly platform = 'LINKEDIN';

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly callbackUrl: string;

  constructor(config: ConfigService) {
    super();
    this.clientId = config.get<string>('social.linkedin.clientId') ?? '';
    this.clientSecret = config.get<string>('social.linkedin.clientSecret') ?? '';
    this.callbackUrl = config.get<string>('social.linkedin.callbackUrl') ?? '';
  }

  getAuthUrl(workspaceId: string, userId: string): string {
    const state = this.encodeState(workspaceId, userId);
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      scope: 'openid profile email w_member_social',
      state,
    });
    return `${OAUTH_URL}?${params.toString()}`;
  }

  async exchangeCode(code: string, state: string): Promise<OAuthTokens> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.callbackUrl,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = await res.json() as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };

    const profile = await this.getProfile(data.access_token);
    this.decodeState(state);

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
      profile,
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenSet> {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = await res.json() as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
    };
  }

  async getProfile(accessToken: string): Promise<PlatformProfile> {
    const res = await fetch(ME_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json() as {
      sub: string;
      name: string;
      email?: string;
      picture?: string;
    };
    return {
      platformId: data.sub,
      name: data.name,
      email: data.email,
      profilePicture: data.picture,
    };
  }
}
