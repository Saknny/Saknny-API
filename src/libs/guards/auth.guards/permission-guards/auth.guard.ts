import { ExecutionContext } from '@nestjs/common';
import { ErrorCodeEnum } from '@src/libs/application/exceptions/error-code.enum';
import { BaseHttpException } from '@src/libs/application/exceptions/base-http-exception';
import { IAuthGuard } from './.auth-guard.interface';
import { IContextAuthService } from '@src/libs/application/context/context-auth.interface';
import { AuthOpts } from '@src/libs/decorators/auth.decorator';

export class AuthenticatedGuard implements IAuthGuard {
  constructor(
    public readonly authOpts: AuthOpts,
    public readonly authService: IContextAuthService,
  ) {}

  unauthorizedException = new BaseHttpException(ErrorCodeEnum.UNAUTHORIZED);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request?.user) throw this.unauthorizedException;

    return true;
  }
}
