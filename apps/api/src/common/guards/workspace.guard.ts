import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type { JwtPayload } from '../types';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(private readonly db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const workspaceId: string | undefined = request.params?.workspaceId;

    if (!workspaceId) return true;

    const user = request.user as JwtPayload;

    const workspace = await this.db.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          where: { userId: user.sub },
          take: 1,
        },
      },
    });

    if (!workspace) throw new NotFoundException('Workspace not found');

    if (workspace.organizationId !== user.orgId) {
      throw new ForbiddenException('Access denied to this workspace');
    }

    if (!workspace.members.length) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    request.workspace = workspace;
    request.workspaceMember = workspace.members[0];

    return true;
  }
}
