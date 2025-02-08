import { ExecutionContext } from '@nestjs/common';
import { BaseHttpException } from '@src/libs/application/exceptions/base-http-exception';
import { ErrorCodeEnum } from '@src/libs/application/exceptions/error-code.enum';
import { IAuthGuard } from './.auth-guard.interface';
import { IContextAuthService } from '@src/libs/application/context/context-auth.interface';
import { AuthOpts } from '@src/libs/decorators/auth.decorator';
import { UserRoleEnum } from '../../../../modules/user/enums/user.enum';

export class StudentOnlyGuard implements IAuthGuard {
  constructor(
    public readonly authOpts: AuthOpts,
    public readonly authService: IContextAuthService,
  ) {}

  unauthorizedException = new BaseHttpException(ErrorCodeEnum.UNAUTHORIZED);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    const { error } = this.authOpts;

    const unauthorizedException = error
      ? new BaseHttpException(error)
      : this.unauthorizedException;

    if (
      !user ||
      user.role !== UserRoleEnum.STUDENT ||
      !user?.student?.onboardingCompleted
    )
      throw unauthorizedException;

    return true;
  }
}
