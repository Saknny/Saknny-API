import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
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
import { Auth } from '@src/libs/decorators/auth.decorator';

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
  async verifyAccount(@Body() { email, otp }: VerifyUserInput) {
    console.log("here")
    const user = await this.authService.verifyAccount(email, otp);
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
  @Auth({ allow: 'authenticated' })
  async updateEmail(
    @currentUser() user: currentUserType,
    @Body() updateEmailInput: UpdateEmailInput,
  ) {
    const updatedUser = await this.authService.updateEmail(
      user.id,
      updateEmailInput,
    );
    const session = await this.sessionService.create(updatedUser);
    return await this.authService.appendAuthTokenToResponse(
      updatedUser,
      session,
    );
  }

  @Post('forget-password')
  @Serialize(AuthResponse)
  @HttpCode(HttpStatus.OK)
  async forgetPassword(@Body() { email }: { email: string }) {
    return await this.authService.forgetPassword(email);
  }

  @Patch('update-password')
  @Serialize(AuthResponse)
  @HttpCode(HttpStatus.OK)
  @Auth({ allow: 'authenticated' })
  async updatePassword(
    @currentUser() user: currentUserType,
    @Body() updatePasswordInput: UpdatePasswordInput,
  ) {
    const updatedUser = await this.authService.updatePassword(
      user.id,
      updatePasswordInput,
    );
    const session = await this.sessionService.create(updatedUser);
    return await this.authService.appendAuthTokenToResponse(
      updatedUser,
      session,
    );
  }

  @Get()
  @Serialize(UserResponse)
  @HttpCode(HttpStatus.OK)
  @Auth({ allow: 'authenticated' })
  async getMe(@currentUser() user: currentUserType) {
    console.log(user);
    return user;
  }

@Auth({ allow: 'authenticated' })
@HttpCode(HttpStatus.OK)
@Post('logout')
async logout(@currentUser() user: currentUserType, @Req() req: Request) {
  // Get the JWT from headers
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    throw new BadRequestException('Authorization token not found');
  }

  // Decode the JWT to get the sessionId (without verification)
  const decoded = this.decodeJwt(token);
  const sessionId = decoded?.sessionId;

  if (!sessionId) {
    throw new BadRequestException('Session ID not found in token');
  }

  await this.sessionService.remove(sessionId);
  return { message: 'Logged out successfully' };
}

// Add this helper method to your controller
private decodeJwt(token: string): any {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  } catch (e) {
    throw new BadRequestException('Invalid token format');
  }
}

}
