import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { TokenPayload } from '../types/auth-token-payload.type';
import { Inject, Injectable } from '@nestjs/common';
import {
  IContextAuthService,
  IContextAuthServiceToken,
} from '../application/context/context-auth.interface';
import { BaseHttpException } from '../application/exceptions/base-http-exception';
import { ErrorCodeEnum } from '../application/exceptions/error-code.enum';
import { get } from 'env-var';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(IContextAuthServiceToken)
    private readonly authService: IContextAuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: get('JWT_PUBLIC').asString(),
      ignoreExpiration: false,
      logging: true,
    });
  }

  async validate(payload: TokenPayload): Promise<any> {
    if (!payload || !payload.userId)
      throw new BaseHttpException(ErrorCodeEnum.UNAUTHORIZED);

    const { user, session } =
      await this.authService.getUserAndSessionFromPayload(payload);
    console.log('✅ Fetched User:', user); 
    return { ...user, session };
  }
}
