import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PublishingService } from './publishing.service';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';

@ApiTags('publishing')
@ApiBearerAuth()
@UseGuards(WorkspaceGuard)
@Controller({ path: 'publishing', version: '1' })
export class PublishingController {
  constructor(private readonly publishingService: PublishingService) {}

  @Post('workspaces/:workspaceId/posts/:postId/schedule')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Schedule a post' })
  async schedulePost(
    @Param('workspaceId') workspaceId: string,
    @Param('postId') postId: string,
  ) {
    return this.publishingService.schedulePost(postId, workspaceId);
  }

  @Post('workspaces/:workspaceId/posts/:postId/publish-now')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish a post immediately' })
  async publishNow(
    @Param('workspaceId') workspaceId: string,
    @Param('postId') postId: string,
  ) {
    return this.publishingService.publishNow(postId, workspaceId);
  }

  @Delete('workspaces/:workspaceId/posts/:postId/schedule')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a scheduled post' })
  async cancelSchedule(
    @Param('workspaceId') workspaceId: string,
    @Param('postId') postId: string,
  ) {
    return this.publishingService.cancelScheduledPost(postId, workspaceId);
  }

  @Post('workspaces/:workspaceId/posts/:postId/retry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry a failed post' })
  async retryPost(
    @Param('workspaceId') workspaceId: string,
    @Param('postId') postId: string,
  ) {
    return this.publishingService.retryPost(postId, workspaceId);
  }

  @Get('queue/stats')
  @ApiOperation({ summary: 'Get publishing queue stats' })
  async queueStats() {
    return { data: await this.publishingService.getQueueStats() };
  }
}
