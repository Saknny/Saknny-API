import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  IContextAuthService,
  IContextAuthServiceToken,
} from '@src/libs/application/context/context-auth.interface';
import { AuthGuards } from './permission-guards';
import { AuthOpts } from '../../decorators/auth.decorator';
import { IAuthGuard } from './permission-guards/.auth-guard.interface';

@Injectable()
export class MediatorGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(IContextAuthServiceToken)
    private readonly authService: IContextAuthService,
  ) {}

  private guard: IAuthGuard;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authOpts =
      this.reflector.get<AuthOpts>('authOpts', context.getHandler()) ||
      this.reflector.get<AuthOpts>('authOpts', context.getClass());

    this.guard = new AuthGuards[authOpts.allow || 'authenticated'](
      authOpts,
      this.authService,
    );
    return this.guard.canActivate(context);
  }
}
