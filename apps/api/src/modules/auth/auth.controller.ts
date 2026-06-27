import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Version,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MagicLinkRequestDto, MagicLinkVerifyDto } from './dto/magic-link.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/types';
import type { GoogleProfile } from './strategies/google.strategy';
import { ConfigService } from '@nestjs/config';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: FastifyReply) {
    const result = await this.authService.register(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return { data: { user: result.user, accessToken: result.accessToken } };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: FastifyReply) {
    const result = await this.authService.login(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return { data: { user: result.user, accessToken: result.accessToken } };
  }

  @Public()
  @Post('magic-link')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a magic link email' })
  async requestMagicLink(@Body() dto: MagicLinkRequestDto) {
    return this.authService.sendMagicLink(dto.email);
  }

  @Public()
  @Get('magic-link/verify')
  @ApiOperation({ summary: 'Verify magic link token' })
  async verifyMagicLink(
    @Query() dto: MagicLinkVerifyDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const result = await this.authService.verifyMagicLink(dto.token);
    this.setRefreshCookie(res, result.refreshToken);
    return { data: { user: result.user, accessToken: result.accessToken } };
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth' })
  googleAuth() {
    // Passport redirects to Google
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(@Req() req: { user: GoogleProfile }, @Res() res: FastifyReply) {
    const result = await this.authService.handleGoogleCallback(req.user);
    this.setRefreshCookie(res, result.refreshToken);
    const appUrl = this.config.get<string>('appUrl');
    void res.redirect(`${appUrl}/auth/callback?token=${result.accessToken}`);
  }

  @Public()
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(
    @CurrentUser() user: JwtPayload & { refreshToken: string },
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const tokens = await this.authService.refreshTokens(user.sub, user.refreshToken);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { data: { accessToken: tokens.accessToken } };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current session' })
  async logout(@CurrentUser() user: JwtPayload, @Res({ passthrough: true }) res: FastifyReply) {
    await this.authService.logout(user.sub);
    void res.clearCookie('refresh_token');
    return { data: null, message: 'Logged out successfully' };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async me(@CurrentUser() user: JwtPayload) {
    const data = await this.authService.getMe(user.sub);
    return { data };
  }

  private setRefreshCookie(res: FastifyReply, token: string) {
    void res.setCookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/api/auth/refresh',
    });
  }
}
