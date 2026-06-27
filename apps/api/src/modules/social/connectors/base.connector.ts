export interface PlatformProfile {
  platformId: string;
  name: string;
  username?: string;
  profilePicture?: string;
  followersCount?: number;
  email?: string;
}

export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string;
}

export interface OAuthTokens extends TokenSet {
  profile: PlatformProfile;
}

export abstract class BaseSocialConnector {
  abstract readonly platform: string;

  abstract getAuthUrl(workspaceId: string, userId: string): string;
  abstract exchangeCode(code: string, state: string): Promise<OAuthTokens>;
  abstract refreshToken(refreshToken: string): Promise<TokenSet>;
  abstract getProfile(accessToken: string): Promise<PlatformProfile>;

  protected encodeState(workspaceId: string, userId: string): string {
    return Buffer.from(JSON.stringify({ workspaceId, userId, ts: Date.now() })).toString('base64url');
  }

  decodeState(state: string): { workspaceId: string; userId: string } {
    try {
      return JSON.parse(Buffer.from(state, 'base64url').toString()) as {
        workspaceId: string;
        userId: string;
      };
    } catch {
      throw new Error('Invalid OAuth state');
    }
  }
}
