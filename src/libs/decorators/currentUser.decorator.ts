import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { BaseHttpException } from '../application/exceptions/base-http-exception';
import { ErrorCodeEnum } from '../application/exceptions/error-code.enum';

export const currentUser = createParamDecorator(
  (fieldName: string, ctx: ExecutionContext) => {
    console.log('entered ')
    const request = ctx.switchToHttp().getRequest();

    const { user } = request;
    console.log('Request User:', request.user);
    if (!user) throw new BaseHttpException(ErrorCodeEnum.UNAUTHORIZED);

    if (fieldName) return user[fieldName];
    console.log('User:',user);
    return user;
  },
);
