import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { MediaService } from './media.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import type { JwtPayload } from '../../common/types';
import { IsString, IsEnum, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class GetUploadUrlDto {
  @ApiProperty() @IsString() filename: string;
  @ApiProperty() @IsString() contentType: string;
  @ApiProperty() @IsNumber() @Min(1) @Type(() => Number) size: number;
}

class ApprovePostDto {
  @ApiProperty({ enum: ['approved', 'rejected'] })
  @IsEnum(['approved', 'rejected'])
  action: 'approved' | 'rejected';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  comment?: string;
}

@ApiTags('content')
@ApiBearerAuth()
@UseGuards(WorkspaceGuard)
@Controller({ path: 'content', version: '1' })
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly mediaService: MediaService,
  ) {}

  @Get('workspaces/:workspaceId/posts')
  @ApiOperation({ summary: 'List posts in a workspace' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'search', required: false })
  async listPosts(
    @Param('workspaceId') workspaceId: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('search') search?: string,
  ) {
    return {
      data: await this.contentService.listPosts(workspaceId, {
        status,
        page: page ? parseInt(page) : 1,
        search,
      }),
    };
  }

  @Post('workspaces/:workspaceId/posts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a post' })
  async createPost(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreatePostDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return { data: await this.contentService.createPost(workspaceId, user.sub, dto) };
  }

  @Get('workspaces/:workspaceId/posts/:postId')
  @ApiOperation({ summary: 'Get a post' })
  async getPost(
    @Param('workspaceId') workspaceId: string,
    @Param('postId') postId: string,
  ) {
    return { data: await this.contentService.getPost(postId, workspaceId) };
  }

  @Patch('workspaces/:workspaceId/posts/:postId')
  @ApiOperation({ summary: 'Update a post' })
  async updatePost(
    @Param('workspaceId') workspaceId: string,
    @Param('postId') postId: string,
    @Body() dto: UpdatePostDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return { data: await this.contentService.updatePost(postId, workspaceId, user.sub, dto) };
  }

  @Delete('workspaces/:workspaceId/posts/:postId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a post' })
  async deletePost(
    @Param('workspaceId') workspaceId: string,
    @Param('postId') postId: string,
  ) {
    return this.contentService.deletePost(postId, workspaceId);
  }

  @Post('workspaces/:workspaceId/posts/:postId/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve or reject a post' })
  async approvePost(
    @Param('workspaceId') workspaceId: string,
    @Param('postId') postId: string,
    @Body() dto: ApprovePostDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return {
      data: await this.contentService.approvePost(
        postId,
        workspaceId,
        user.sub,
        dto.action === 'approved',
        dto.comment,
      ),
    };
  }

  @Post('workspaces/:workspaceId/media/upload-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a presigned URL for media upload' })
  async getUploadUrl(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: GetUploadUrlDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!user.orgId) throw new Error('No org context');
    const result = await this.mediaService.getUploadUrl(
      user.orgId,
      workspaceId,
      dto.filename,
      dto.contentType,
      dto.size,
    );
    return { data: result };
  }
}
