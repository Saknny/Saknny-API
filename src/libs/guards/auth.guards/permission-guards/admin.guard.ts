import { ExecutionContext } from '@nestjs/common';
import { ErrorCodeEnum } from '@src/libs/application/exceptions/error-code.enum';
import { BaseHttpException } from '@src/libs/application/exceptions/base-http-exception';
import { IAuthGuard } from './.auth-guard.interface';
import { IContextAuthService } from '@src/libs/application/context/context-auth.interface';
import { AuthOpts } from '@src/libs/decorators/auth.decorator';

export class AdminOnlyGuard implements IAuthGuard {
  constructor(
    public readonly authOpts: AuthOpts,
    public readonly authService: IContextAuthService,
  ) {}

  unauthorizedException = new BaseHttpException(ErrorCodeEnum.UNAUTHORIZED);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { permissions, error } = this.authOpts;

    const request = context.switchToHttp().getRequest();
    const user = request?.user;

    const unauthorizedException = error
      ? new BaseHttpException(error)
      : this.unauthorizedException;

    if (
      !user?.securityGroupId ||
      (permissions?.length &&
        !this.authService.hasPermission(permissions[0], user))
    )
      throw unauthorizedException;

    return true;
  }
}
