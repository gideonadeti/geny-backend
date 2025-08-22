import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthRequest } from '@app/interfaces';

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;

    return user.id;
  },
);
