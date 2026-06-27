import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { SocialService } from './social.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { Workspace } from '../../common/decorators/workspace.decorator';
import type { JwtPayload } from '../../common/types';
import { ConfigService } from '@nestjs/config';

type Platform = 'FACEBOOK' | 'INSTAGRAM' | 'TWITTER' | 'LINKEDIN' | 'TIKTOK' | 'YOUTUBE' | 'PINTEREST';

@ApiTags('social')
@ApiBearerAuth()
@Controller({ path: 'social', version: '1' })
export class SocialController {
  constructor(
    private readonly socialService: SocialService,
    private readonly config: ConfigService,
  ) {}

  @Get('workspaces/:workspaceId/accounts')
  @UseGuards(WorkspaceGuard)
  @ApiOperation({ summary: 'List connected social accounts' })
  async listAccounts(@Param('workspaceId') workspaceId: string) {
    return { data: await this.socialService.listAccounts(workspaceId) };
  }

  @Get('workspaces/:workspaceId/accounts/connect/:platform')
  @UseGuards(WorkspaceGuard)
  @ApiOperation({ summary: 'Initiate OAuth connection for a platform' })
  async connect(
    @Param('workspaceId') workspaceId: string,
    @Param('platform') platform: Platform,
    @CurrentUser() user: JwtPayload,
    @Res() res: FastifyReply,
  ) {
    const url = this.socialService.getAuthUrl(platform.toUpperCase() as Platform, workspaceId, user.sub);
    void res.redirect(url);
  }

  @Get('callback/:platform')
  @ApiOperation({ summary: 'OAuth callback from platform' })
  async callback(
    @Param('platform') platform: Platform,
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: FastifyReply,
  ) {
    await this.socialService.handleCallback(platform.toUpperCase() as Platform, code, state);
    const appUrl = this.config.get<string>('appUrl');
    void res.redirect(`${appUrl}/connections?connected=true`);
  }

  @Get('workspaces/:workspaceId/accounts/:accountId')
  @UseGuards(WorkspaceGuard)
  @ApiOperation({ summary: 'Get a social account' })
  async getAccount(
    @Param('workspaceId') workspaceId: string,
    @Param('accountId') accountId: string,
  ) {
    return { data: await this.socialService.getAccount(accountId, workspaceId) };
  }

  @Post('workspaces/:workspaceId/accounts/:accountId/refresh')
  @UseGuards(WorkspaceGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh platform token' })
  async refreshAccount(
    @Param('workspaceId') workspaceId: string,
    @Param('accountId') accountId: string,
  ) {
    return { data: await this.socialService.refreshAccount(accountId, workspaceId) };
  }

  @Delete('workspaces/:workspaceId/accounts/:accountId')
  @UseGuards(WorkspaceGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disconnect a social account' })
  async disconnectAccount(
    @Param('workspaceId') workspaceId: string,
    @Param('accountId') accountId: string,
  ) {
    return this.socialService.disconnectAccount(accountId, workspaceId);
  }
}
