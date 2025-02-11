import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ContextAuthService } from '../application/context/context-auth.service';
import { User } from '@src/modules/user/entities/user.entity';
import {
  IContextAuthService,
  IContextAuthServiceToken,
} from '../application/context/context-auth.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(IContextAuthServiceToken)
    private readonly authService: IContextAuthService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const user: User = await this.authService.getUserFromReqHeaders(req);
      if (user) {
        (req as any).user = user; // Attach user to the request
      }
    } catch (error) {
      console.error('Auth Middleware Error:', error);
    }
    next();
  }
}
