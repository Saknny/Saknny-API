import { Strategy } from 'passport-local';
import { AuthService } from '../../modules/auth/auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { LoginInput } from '../../modules/auth/dtos/inputs/login.input';
import { BaseHttpException } from '../application/exceptions/base-http-exception';
import { ErrorCodeEnum } from '../application/exceptions/error-code.enum';
import { isEnum } from 'class-validator';
import { UserRoleEnum } from '../../modules/user/enums/user.enum';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, email: string, password: string): Promise<any> {
    const { role } = req.body as LoginInput;
    if (!isEnum(role, UserRoleEnum))
      throw new BaseHttpException(ErrorCodeEnum.BAD_ROLE_TYPE);
    const user = await this.authService.validateUser(email, password, role);
    if (!user) throw new BaseHttpException(ErrorCodeEnum.UNAUTHORIZED);
    else return user;
  }
}
