export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER',
} as const;

export type Role = keyof typeof ROLES;

export const ROLE_HIERARCHY: Record<Role, number> = {
  OWNER: 5,
  ADMIN: 4,
  MANAGER: 3,
  EDITOR: 2,
  VIEWER: 1,
};

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export const PERMISSIONS = {
  POST_CREATE: 'EDITOR',
  POST_PUBLISH: 'MANAGER',
  POST_APPROVE: 'MANAGER',
  POST_DELETE: 'ADMIN',
  MEMBER_INVITE: 'ADMIN',
  MEMBER_REMOVE: 'ADMIN',
  ACCOUNT_CONNECT: 'ADMIN',
  BILLING_MANAGE: 'OWNER',
  WORKSPACE_CREATE: 'ADMIN',
  WORKSPACE_DELETE: 'OWNER',
} as const satisfies Record<string, Role>;

export type Permission = keyof typeof PERMISSIONS;

export function can(userRole: Role, permission: Permission): boolean {
  return hasPermission(userRole, PERMISSIONS[permission]);
}
