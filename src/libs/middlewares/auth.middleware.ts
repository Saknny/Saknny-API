import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
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
    if (!req.headers.authorization) {
      return next(); // Skip authentication if no Authorization header is present
    }

    try {
      const user = await this.authService.getUserFromReqHeaders(req);
      if (user) {
        (req as any).user = user; // Attach user to the request
      }
    } catch (error) {
      console.error('Auth Middleware Error:', error);
    }

    next();
  }
}
