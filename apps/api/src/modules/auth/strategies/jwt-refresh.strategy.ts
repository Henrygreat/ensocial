import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { JwtPayload } from '../../../common/types';

type RequestWithCookies = {
  cookies?: Record<string, string>;
  headers: { authorization?: string };
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: RequestWithCookies) => req?.cookies?.['refresh_token'] ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.refreshSecret'),
      passReqToCallback: true,
    });
  }

  validate(req: RequestWithCookies, payload: JwtPayload): JwtPayload & { refreshToken: string } {
    const refreshToken =
      req.cookies?.['refresh_token'] ??
      req.headers.authorization?.replace('Bearer ', '');

    if (!refreshToken) throw new UnauthorizedException('Refresh token required');

    return { ...payload, refreshToken };
  }
}
