import type { WorkspaceRole } from '@ensocial/types';

export interface JwtPayload {
  sub: string;
  email: string;
  orgId: string | null;
  iat?: number;
  exp?: number;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
  workspace?: {
    id: string;
    organizationId: string;
    name: string;
    slug: string;
  };
  workspaceMember?: {
    role: WorkspaceRole;
  };
}
