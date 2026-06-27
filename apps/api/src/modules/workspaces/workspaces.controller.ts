import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './dto/create-workspace.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/types';

@ApiTags('workspaces')
@ApiBearerAuth()
@Controller({ path: 'workspaces', version: '1' })
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get('org/:orgId')
  @ApiOperation({ summary: 'List workspaces in an organization' })
  async listWorkspaces(@Param('orgId') orgId: string, @CurrentUser() user: JwtPayload) {
    return { data: await this.workspacesService.listWorkspaces(orgId, user.sub) };
  }

  @Post('org/:orgId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a workspace' })
  async createWorkspace(
    @Param('orgId') orgId: string,
    @Body() dto: CreateWorkspaceDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return { data: await this.workspacesService.createWorkspace(orgId, user.sub, dto) };
  }

  @Get(':workspaceId')
  @ApiOperation({ summary: 'Get workspace details' })
  async getWorkspace(@Param('workspaceId') workspaceId: string, @CurrentUser() user: JwtPayload) {
    return { data: await this.workspacesService.getWorkspace(workspaceId, user.sub) };
  }

  @Patch(':workspaceId')
  @ApiOperation({ summary: 'Update workspace' })
  async updateWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: UpdateWorkspaceDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return { data: await this.workspacesService.updateWorkspace(workspaceId, user.sub, dto) };
  }

  @Delete(':workspaceId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete workspace' })
  async deleteWorkspace(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.workspacesService.deleteWorkspace(workspaceId, user.sub);
  }
}
