import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InboxService } from './inbox.service';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';

@ApiTags('inbox')
@ApiBearerAuth()
@UseGuards(WorkspaceGuard)
@Controller({ path: 'inbox', version: '1' })
export class InboxController {
  constructor(private readonly inboxService: InboxService) {}

  @Get('workspaces/:workspaceId/conversations')
  @ApiOperation({ summary: 'List inbox conversations' })
  async getConversations(
    @Param('workspaceId') workspaceId: string,
    @Query('page') page?: string,
  ) {
    return {
      data: await this.inboxService.getConversations(workspaceId, page ? parseInt(page) : 1),
    };
  }
}
