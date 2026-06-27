import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DatabaseService } from '../../database/database.service';
import type { CreateOrganizationDto } from './dto/create-organization.dto';
import type { UpdateOrganizationDto } from './dto/update-organization.dto';
import type { InviteMemberDto, UpdateMemberRoleDto } from './dto/invite-member.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly events: EventEmitter2,
  ) {}

  async getOrganization(orgId: string, userId: string) {
    await this.assertMember(orgId, userId);

    return this.db.organization.findUniqueOrThrow({
      where: { id: orgId },
      include: {
        members: { include: { user: true } },
        _count: { select: { workspaces: true } },
        subscription: true,
      },
    });
  }

  async updateOrganization(orgId: string, userId: string, dto: UpdateOrganizationDto) {
    await this.assertRole(orgId, userId, ['OWNER', 'ADMIN']);

    if (dto.name) {
      const slug = await this.generateSlug(dto.name, orgId);
      return this.db.organization.update({
        where: { id: orgId },
        data: { ...dto, slug },
      });
    }

    return this.db.organization.update({ where: { id: orgId }, data: dto });
  }

  async getMembers(orgId: string, userId: string) {
    await this.assertMember(orgId, userId);

    return this.db.orgMember.findMany({
      where: { organizationId: orgId },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async inviteMember(orgId: string, inviterId: string, dto: InviteMemberDto) {
    await this.assertRole(orgId, inviterId, ['OWNER', 'ADMIN']);

    const org = await this.db.organization.findUniqueOrThrow({ where: { id: orgId } });

    let invitee = await this.db.user.findUnique({ where: { email: dto.email } });

    if (!invitee) {
      invitee = await this.db.user.create({
        data: { name: dto.email.split('@')[0], email: dto.email },
      });
    }

    const existing = await this.db.orgMember.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId: invitee.id } },
    });
    if (existing) throw new ConflictException('User is already a member');

    const member = await this.db.orgMember.create({
      data: { organizationId: orgId, userId: invitee.id, role: dto.role },
      include: { user: true },
    });

    this.events.emit('org.member_invited', {
      orgName: org.name,
      inviteeEmail: dto.email,
      role: dto.role,
    });

    return member;
  }

  async updateMemberRole(orgId: string, actorId: string, targetUserId: string, dto: UpdateMemberRoleDto) {
    await this.assertRole(orgId, actorId, ['OWNER', 'ADMIN']);

    const target = await this.db.orgMember.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId: targetUserId } },
    });
    if (!target) throw new NotFoundException('Member not found');
    if (target.role === 'OWNER') throw new ForbiddenException('Cannot change owner role');

    return this.db.orgMember.update({
      where: { organizationId_userId: { organizationId: orgId, userId: targetUserId } },
      data: { role: dto.role },
      include: { user: true },
    });
  }

  async removeMember(orgId: string, actorId: string, targetUserId: string) {
    await this.assertRole(orgId, actorId, ['OWNER', 'ADMIN']);

    const target = await this.db.orgMember.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId: targetUserId } },
    });
    if (!target) throw new NotFoundException('Member not found');
    if (target.role === 'OWNER') throw new ForbiddenException('Cannot remove the owner');

    await this.db.orgMember.delete({
      where: { organizationId_userId: { organizationId: orgId, userId: targetUserId } },
    });

    return { message: 'Member removed' };
  }

  private async assertMember(orgId: string, userId: string) {
    const member = await this.db.orgMember.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId } },
    });
    if (!member) throw new ForbiddenException('Not a member of this organization');
    return member;
  }

  private async assertRole(orgId: string, userId: string, roles: string[]) {
    const member = await this.assertMember(orgId, userId);
    if (!roles.includes(member.role)) {
      throw new ForbiddenException(`Required role: ${roles.join(' or ')}`);
    }
    return member;
  }

  private async generateSlug(name: string, excludeId?: string): Promise<string> {
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
    let slug = base;
    let n = 1;
    while (true) {
      const existing = await this.db.organization.findUnique({ where: { slug } });
      if (!existing || existing.id === excludeId) break;
      slug = `${base}-${n++}`;
    }
    return slug;
  }
}
