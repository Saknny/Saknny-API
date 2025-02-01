import { CanActivate, ExecutionContext } from '@nestjs/common';
import { IContextAuthService } from '@src/libs/application/context/context-auth.interface';
import { BaseHttpException } from '@src/libs/application/exceptions/base-http-exception';
import { AuthOpts } from '@src/libs/decorators/auth.decorator';

export interface IAuthGuard extends CanActivate {
  /**
   * Represents the exception that is thrown if the user is not authenticated.
   * The default value is `BaseHttpException(ErrorCodeEnum.UNAUTHORIZED)`.
   *
   * @type {BaseHttpException}
   */
  unauthorizedException?: BaseHttpException;
  canActivate(context: ExecutionContext): Promise<boolean>;
  authOpts: AuthOpts;
  authService: IContextAuthService;
}
