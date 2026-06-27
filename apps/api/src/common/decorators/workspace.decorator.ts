import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Workspace = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.workspace;
  },
);

export const WorkspaceMember = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.workspaceMember;
  },
);
