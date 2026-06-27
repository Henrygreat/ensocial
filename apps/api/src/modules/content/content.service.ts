import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type { CreatePostDto } from './dto/create-post.dto';
import type { UpdatePostDto } from './dto/update-post.dto';

interface ListPostsOptions {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}

@Injectable()
export class ContentService {
  constructor(private readonly db: DatabaseService) {}

  async listPosts(workspaceId: string, opts: ListPostsOptions = {}) {
    const { status, page = 1, limit = 20, search } = opts;

    const where = {
      workspaceId,
      ...(status && { status: status as never }),
      ...(search && {
        content: { contains: search, mode: 'insensitive' as const },
      }),
    };

    const [posts, total] = await Promise.all([
      this.db.post.findMany({
        where,
        include: {
          socialAccounts: { include: { socialAccount: true } },
          approvals: true,
          analytics: true,
          createdBy: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.db.post.count({ where }),
    ]);

    return { posts, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async createPost(workspaceId: string, userId: string, dto: CreatePostDto) {
    if (!dto.content && (!dto.mediaUrls || dto.mediaUrls.length === 0)) {
      throw new BadRequestException('Post must have content or media');
    }

    // Validate that the social accounts belong to this workspace
    const accounts = await this.db.socialAccount.findMany({
      where: {
        id: { in: dto.socialAccountIds },
        workspaceId,
        isActive: true,
      },
    });

    if (accounts.length !== dto.socialAccountIds.length) {
      throw new BadRequestException('One or more social accounts are invalid or inactive');
    }

    const post = await this.db.post.create({
      data: {
        content: dto.content ?? '',
        firstComment: dto.firstComment,
        mediaUrls: dto.mediaUrls ?? [],
        status: (dto.requiresApproval ? 'PENDING_APPROVAL' : (dto.status ?? 'DRAFT')) as never,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        workspaceId,
        createdById: userId,
        socialAccounts: {
          create: dto.socialAccountIds.map((id) => ({
            socialAccountId: id,
            status: 'DRAFT' as never,
          })),
        },
      },
      include: {
        socialAccounts: { include: { socialAccount: true } },
        createdBy: { select: { id: true, name: true, image: true } },
      },
    });

    return post;
  }

  async getPost(postId: string, workspaceId: string) {
    const post = await this.db.post.findFirst({
      where: { id: postId, workspaceId },
      include: {
        socialAccounts: { include: { socialAccount: true } },
        approvals: { include: { approver: { select: { id: true, name: true, image: true } } } },
        analytics: true,
        createdBy: { select: { id: true, name: true, image: true } },
      },
    });

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async updatePost(postId: string, workspaceId: string, userId: string, dto: UpdatePostDto) {
    const post = await this.db.post.findFirst({ where: { id: postId, workspaceId } });
    if (!post) throw new NotFoundException('Post not found');

    if (!['DRAFT', 'PENDING_APPROVAL'].includes(post.status)) {
      throw new ForbiddenException('Only draft or pending posts can be edited');
    }

    const data: Record<string, unknown> = {};
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.firstComment !== undefined) data.firstComment = dto.firstComment;
    if (dto.mediaUrls !== undefined) data.mediaUrls = dto.mediaUrls;
    if (dto.scheduledAt !== undefined) data.scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;

    if (dto.socialAccountIds) {
      await this.db.postSocialAccount.deleteMany({ where: { postId } });
      data.socialAccounts = {
        create: dto.socialAccountIds.map((id) => ({
          socialAccountId: id,
          status: 'DRAFT' as never,
        })),
      };
    }

    return this.db.post.update({
      where: { id: postId },
      data,
      include: {
        socialAccounts: { include: { socialAccount: true } },
        createdBy: { select: { id: true, name: true, image: true } },
      },
    });
  }

  async deletePost(postId: string, workspaceId: string) {
    const post = await this.db.post.findFirst({ where: { id: postId, workspaceId } });
    if (!post) throw new NotFoundException('Post not found');

    if (post.status === 'PUBLISHING') {
      throw new ForbiddenException('Cannot delete a post that is being published');
    }

    await this.db.post.delete({ where: { id: postId } });
    return { message: 'Post deleted' };
  }

  async approvePost(postId: string, workspaceId: string, approverId: string, approved: boolean, comment?: string) {
    const post = await this.db.post.findFirst({
      where: { id: postId, workspaceId, status: 'PENDING_APPROVAL' },
    });
    if (!post) throw new NotFoundException('Post not found or not pending approval');

    await this.db.postApproval.upsert({
      where: { postId_approverId: { postId, approverId } },
      create: {
        postId,
        approverId,
        status: (approved ? 'APPROVED' : 'REJECTED') as never,
        comment,
      },
      update: {
        status: (approved ? 'APPROVED' : 'REJECTED') as never,
        comment,
      },
    });

    if (approved) {
      await this.db.post.update({
        where: { id: postId },
        data: { status: 'APPROVED' as never },
      });
    } else {
      await this.db.post.update({
        where: { id: postId },
        data: { status: 'DRAFT' as never },
      });
    }

    return this.getPost(postId, workspaceId);
  }
}
