import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupInput } from './dtos/inputs/signup.input';
import { AuthResponse } from './dtos/responses/auth.response';

import { LoginInput } from './dtos/inputs/login.input';
import { LocalAuthGuard } from '../../libs/guards/strategy.guards/local.guard';
import { Serialize } from '../../libs/interceptors/serialize.interceptor';
import { JwtAuthenticationGuard } from '../../libs/guards/strategy.guards/jwt.guard';
import { currentUser } from '../../libs/decorators/currentUser.decorator';
import { currentUserType } from '../../libs/types/current-user.type';
import { UserResponse } from '../user/dtos/responses/user.response';
import { SessionService } from '../session/session.service';
import { Transactional } from 'typeorm-transactional';
import { VerifyUserInput } from './dtos/inputs/verify-user.input';
import { ResetPasswordInput } from './dtos/inputs/reset-password.input';
import { UpdateEmailInput } from './dtos/inputs/update-email.input';
import { UpdatePasswordInput } from './dtos/inputs/update-password.input';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('signup')
  @Serialize(UserResponse)
  @HttpCode(HttpStatus.OK)
  @Transactional()
  async signup(@Body() signupInput: SignupInput) {
    return await this.authService.signup(signupInput);
  }

  @Post('login')
  @Serialize(AuthResponse)
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(@Body() _: LoginInput, @currentUser() user: currentUserType) {
    // if (user.unVerifiedEmail && !user.verifiedEmail) return { user };
    const session = await this.sessionService.create(user);
    return await this.authService.appendAuthTokenToResponse(user, session);
  }

  @Patch('verify-account')
  @Serialize(AuthResponse)
  @HttpCode(HttpStatus.OK)
  async verifyAccount(@Body() { userId, otp }: VerifyUserInput) {
    const user = await this.authService.verifyAccount(userId, otp);
    const session = await this.sessionService.create(user);
    return await this.authService.appendAuthTokenToResponse(user, session);
  }

  @Patch('reset-password')
  @Serialize(AuthResponse)
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordInput: ResetPasswordInput) {
    const user = await this.authService.resetPassword(resetPasswordInput);
    const session = await this.sessionService.create(user);
    return await this.authService.appendAuthTokenToResponse(user, session);
  }

  @Patch('update-email')
  @Serialize(AuthResponse)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthenticationGuard)
  async updateEmail(
    @currentUser() user: currentUserType,
    @Body() updateEmailInput: UpdateEmailInput,
  ) {
    const updatedUser = await this.authService.updateEmail(
      user.id,
      updateEmailInput,
    );
    const session = await this.sessionService.create(updatedUser);
    return await this.authService.appendAuthTokenToResponse(updatedUser, session);
  }

  @Patch('update-password')
  @Serialize(AuthResponse)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthenticationGuard)
  async updatePassword(
    @currentUser() user: currentUserType,
    @Body() updatePasswordInput: UpdatePasswordInput,
  ) {
    const updatedUser = await this.authService.updatePassword(
      user.id,
      updatePasswordInput,
    );
    const session = await this.sessionService.create(updatedUser);
    return await this.authService.appendAuthTokenToResponse(updatedUser, session);
  }

  @Get()
  @Serialize(UserResponse)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthenticationGuard)
  async getMe(@currentUser() user: currentUserType) {
    return user;
  }
}
