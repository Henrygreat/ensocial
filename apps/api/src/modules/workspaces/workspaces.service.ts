import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type { CreateWorkspaceDto, UpdateWorkspaceDto } from './dto/create-workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(private readonly db: DatabaseService) {}

  async listWorkspaces(orgId: string, userId: string) {
    return this.db.workspace.findMany({
      where: {
        organizationId: orgId,
        members: { some: { userId } },
      },
      include: {
        _count: { select: { members: true, socialAccounts: true, posts: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createWorkspace(orgId: string, userId: string, dto: CreateWorkspaceDto) {
    const member = await this.db.orgMember.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId } },
    });
    if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
      throw new ForbiddenException('Only org admins can create workspaces');
    }

    const slug = await this.generateSlug(dto.name, orgId);

    return this.db.workspace.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        organizationId: orgId,
        members: { create: { userId, role: 'OWNER' } },
      },
    });
  }

  async getWorkspace(workspaceId: string, userId: string) {
    const workspace = await this.db.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: { include: { user: true } },
        _count: { select: { socialAccounts: true, posts: true } },
      },
    });

    if (!workspace) throw new NotFoundException('Workspace not found');
    const isMember = workspace.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenException('Not a member of this workspace');

    return workspace;
  }

  async updateWorkspace(workspaceId: string, userId: string, dto: UpdateWorkspaceDto) {
    await this.assertAdminMember(workspaceId, userId);

    const data: Record<string, unknown> = { ...dto };
    if (dto.name) {
      const workspace = await this.db.workspace.findUniqueOrThrow({ where: { id: workspaceId } });
      data.slug = await this.generateSlug(dto.name, workspace.organizationId, workspaceId);
    }

    return this.db.workspace.update({ where: { id: workspaceId }, data });
  }

  async deleteWorkspace(workspaceId: string, userId: string) {
    await this.assertAdminMember(workspaceId, userId);

    await this.db.workspace.delete({ where: { id: workspaceId } });
    return { message: 'Workspace deleted' };
  }

  async addWorkspaceMember(workspaceId: string, actorId: string, targetUserId: string, role: string) {
    await this.assertAdminMember(workspaceId, actorId);

    const workspace = await this.db.workspace.findUniqueOrThrow({ where: { id: workspaceId } });

    const orgMember = await this.db.orgMember.findUnique({
      where: { organizationId_userId: { organizationId: workspace.organizationId, userId: targetUserId } },
    });
    if (!orgMember) throw new ForbiddenException('User must be an org member first');

    return this.db.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
      create: { workspaceId, userId: targetUserId, role: role as never },
      update: { role: role as never },
      include: { user: true },
    });
  }

  private async assertAdminMember(workspaceId: string, userId: string) {
    const member = await this.db.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!member) throw new ForbiddenException('Not a workspace member');
    if (!['OWNER', 'ADMIN', 'MANAGER'].includes(member.role)) {
      throw new ForbiddenException('Insufficient workspace permissions');
    }
    return member;
  }

  private async generateSlug(name: string, orgId: string, excludeId?: string): Promise<string> {
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
    let slug = base;
    let n = 1;
    while (true) {
      const existing = await this.db.workspace.findFirst({
        where: { organizationId: orgId, slug },
      });
      if (!existing || existing.id === excludeId) break;
      slug = `${base}-${n++}`;
    }
    return slug;
  }
}
