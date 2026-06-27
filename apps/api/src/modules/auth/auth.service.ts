import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { DatabaseService } from '../../database/database.service';
import { RedisService } from '../../redis/redis.service';
import { hashToken } from '../../common/utils/crypto';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';
import type { GoogleProfile } from './strategies/google.strategy';
import type { JwtPayload } from '../../common/types';

const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const MAGIC_LINK_TTL_SECONDS = 60 * 15; // 15 minutes

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly events: EventEmitter2,
    private readonly redis: RedisService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.db.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const orgName = dto.orgName ?? `${dto.name}'s Workspace`;

    const user = await this.db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { name: dto.name, email: dto.email, passwordHash, emailVerified: null },
      });

      const org = await tx.organization.create({
        data: {
          name: orgName,
          slug: await this.generateOrgSlug(orgName),
          plan: 'FREE',
          members: { create: { userId: newUser.id, role: 'OWNER' } },
        },
      });

      await tx.workspace.create({
        data: {
          name: 'Default',
          slug: 'default',
          organizationId: org.id,
          members: { create: { userId: newUser.id, role: 'OWNER' } },
        },
      });

      return tx.user.findUniqueOrThrow({
        where: { id: newUser.id },
        include: { orgMembers: { take: 1 } },
      });
    });

    const orgId = user.orgMembers[0]?.organizationId ?? null;
    const tokens = await this.generateTokens(user.id, user.email ?? '', orgId);
    this.events.emit('user.registered', { userId: user.id, email: user.email });
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.db.user.findUnique({
      where: { email: dto.email },
      include: { orgMembers: { take: 1 } },
    });

    if (!user?.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const orgId = user.orgMembers[0]?.organizationId ?? null;
    const tokens = await this.generateTokens(user.id, user.email ?? '', orgId);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async sendMagicLink(email: string) {
    let user = await this.db.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.db.user.create({
        data: { name: email.split('@')[0], email },
      });
    }

    const token = randomBytes(32).toString('hex');
    await this.redis.setex(`magic:${token}`, MAGIC_LINK_TTL_SECONDS, user.id);

    const appUrl = this.config.get<string>('appUrl');
    const link = `${appUrl}/auth/magic-link?token=${token}`;
    this.events.emit('auth.magic_link', { email, link, name: user.name ?? email });
    return { message: 'Magic link sent' };
  }

  async verifyMagicLink(token: string) {
    const userId = await this.redis.get(`magic:${token}`);
    if (!userId) throw new BadRequestException('Invalid or expired magic link');

    await this.redis.del(`magic:${token}`);

    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: { orgMembers: { take: 1 } },
    });
    if (!user) throw new NotFoundException('User not found');

    if (!user.emailVerified) {
      await this.db.user.update({ where: { id: userId }, data: { emailVerified: new Date() } });
    }

    const orgId = user.orgMembers[0]?.organizationId ?? null;
    const tokens = await this.generateTokens(user.id, user.email ?? '', orgId);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async handleGoogleCallback(profile: GoogleProfile) {
    const email = profile.emails[0]?.value;
    if (!email) throw new BadRequestException('No email from Google');

    let user = await this.db.user.findUnique({
      where: { email },
      include: { orgMembers: { take: 1 } },
    });

    if (!user) {
      const name = profile.displayName ?? email.split('@')[0];
      const image = profile.photos[0]?.value;
      const orgName = `${name}'s Workspace`;

      user = await this.db.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name,
            email,
            image,
            emailVerified: new Date(),
            accounts: {
              create: { type: 'oauth', provider: 'google', providerAccountId: profile.id },
            },
          },
        });

        const org = await tx.organization.create({
          data: {
            name: orgName,
            slug: await this.generateOrgSlug(orgName),
            plan: 'FREE',
            members: { create: { userId: newUser.id, role: 'OWNER' } },
          },
        });

        await tx.workspace.create({
          data: {
            name: 'Default',
            slug: 'default',
            organizationId: org.id,
            members: { create: { userId: newUser.id, role: 'OWNER' } },
          },
        });

        return tx.user.findUniqueOrThrow({
          where: { id: newUser.id },
          include: { orgMembers: { take: 1 } },
        });
      });
    }

    const orgId = user.orgMembers[0]?.organizationId ?? null;
    const tokens = await this.generateTokens(user.id, user.email ?? '', orgId);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const stored = await this.redis.get(`refresh:${userId}`);
    if (!stored || stored !== hashToken(refreshToken)) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: { orgMembers: { take: 1 } },
    });
    if (!user) throw new UnauthorizedException('User not found');

    const orgId = user.orgMembers[0]?.organizationId ?? null;
    return this.generateTokens(user.id, user.email ?? '', orgId);
  }

  async logout(userId: string) {
    await this.redis.del(`refresh:${userId}`);
    return { message: 'Logged out' };
  }

  async getMe(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: { orgMembers: { include: { organization: true }, take: 1 } },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitizeUser(user);
  }

  private async generateTokens(userId: string, email: string, orgId: string | null) {
    const payload: JwtPayload = { sub: userId, email, orgId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('jwt.secret'),
        expiresIn: this.config.get<string>('jwt.accessExpiry'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: this.config.get<string>('jwt.refreshExpiry'),
      }),
    ]);

    await this.redis.setex(`refresh:${userId}`, REFRESH_TTL_SECONDS, hashToken(refreshToken));
    return { accessToken, refreshToken };
  }

  private async generateOrgSlug(name: string): Promise<string> {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);
    let slug = base;
    let n = 1;
    while (await this.db.organization.findUnique({ where: { slug } })) {
      slug = `${base}-${n++}`;
    }
    return slug;
  }

  private sanitizeUser(user: Record<string, unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safe } = user as { passwordHash?: string } & Record<string, unknown>;
    return safe;
  }
}
