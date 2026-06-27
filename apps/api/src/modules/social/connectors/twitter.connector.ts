import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseSocialConnector, type OAuthTokens, type PlatformProfile, type TokenSet } from './base.connector';
import { createHash, randomBytes } from 'crypto';

const OAUTH_URL = 'https://twitter.com/i/oauth2/authorize';
const TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
const USER_URL = 'https://api.twitter.com/2/users/me';

@Injectable()
export class TwitterConnector extends BaseSocialConnector {
  readonly platform = 'TWITTER';

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly callbackUrl: string;

  constructor(config: ConfigService) {
    super();
    this.clientId = config.get<string>('social.twitter.apiKey') ?? '';
    this.clientSecret = config.get<string>('social.twitter.apiSecret') ?? '';
    this.callbackUrl = config.get<string>('social.twitter.callbackUrl') ?? '';
  }

  getAuthUrl(workspaceId: string, userId: string): string {
    const state = this.encodeState(workspaceId, userId);
    const codeVerifier = randomBytes(32).toString('base64url');
    const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      scope: 'tweet.read tweet.write users.read offline.access',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    // In production, store codeVerifier in Redis keyed by state
    return `${OAUTH_URL}?${params.toString()}`;
  }

  async exchangeCode(code: string, state: string, codeVerifier?: string): Promise<OAuthTokens> {
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const body = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.callbackUrl,
      code_verifier: codeVerifier ?? 'challenge',
    });

    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: body.toString(),
    });

    const data = await res.json() as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };

    const profile = await this.getProfile(data.access_token);
    const expiresAt = data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000)
      : undefined;

    this.decodeState(state);

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
      profile,
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenSet> {
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
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
    const res = await fetch(
      `${USER_URL}?user.fields=id,name,username,profile_image_url,public_metrics`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const data = await res.json() as {
      data: {
        id: string;
        name: string;
        username: string;
        profile_image_url?: string;
        public_metrics?: { followers_count?: number };
      };
    };

    return {
      platformId: data.data.id,
      name: data.data.name,
      username: `@${data.data.username}`,
      profilePicture: data.data.profile_image_url,
      followersCount: data.data.public_metrics?.followers_count,
    };
  }
}
