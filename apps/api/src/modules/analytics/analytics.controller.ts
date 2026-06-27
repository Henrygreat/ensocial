import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(WorkspaceGuard)
@Controller({ path: 'analytics', version: '1' })
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('workspaces/:workspaceId/overview')
  @ApiOperation({ summary: 'Get workspace analytics overview' })
  @ApiQuery({ name: 'period', enum: ['7d', '30d', '90d'], required: false })
  async getOverview(
    @Param('workspaceId') workspaceId: string,
    @Query('period') period?: '7d' | '30d' | '90d',
  ) {
    return { data: await this.analyticsService.getOverview(workspaceId, period ?? '30d') };
  }

  @Get('workspaces/:workspaceId/posts')
  @ApiOperation({ summary: 'Get post performance analytics' })
  async getPostPerformance(
    @Param('workspaceId') workspaceId: string,
    @Query('page') page?: string,
  ) {
    return {
      data: await this.analyticsService.getPostPerformance(workspaceId, page ? parseInt(page) : 1),
    };
  }

  @Get('workspaces/:workspaceId/accounts')
  @ApiOperation({ summary: 'Get account growth analytics' })
  async getAccountGrowth(
    @Param('workspaceId') workspaceId: string,
    @Query('period') period?: '7d' | '30d' | '90d',
  ) {
    return { data: await this.analyticsService.getAccountGrowth(workspaceId, period ?? '30d') };
  }

  @Post('workspaces/:workspaceId/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger analytics sync for all connected accounts' })
  async triggerSync(@Param('workspaceId') workspaceId: string) {
    return this.analyticsService.triggerSync(workspaceId);
  }
}
