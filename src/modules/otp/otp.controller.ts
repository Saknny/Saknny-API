import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { SendOtpInput } from './dtos/inputs/send-otp.input';
import { VerifyOtpInput } from './dtos/inputs/verify-otp.input';
import { Serialize } from '../../libs/interceptors/serialize.interceptor';
import { UserIdResponse } from '../user/dtos/responses/user.response';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() { userId, useCase }: SendOtpInput) {
    return await this.otpService.sendOtp(userId, useCase);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @Serialize(UserIdResponse)
  async verifyOtp(@Body() verifyOtpInput: VerifyOtpInput) {
    return await this.otpService.verifyOtpOrError(verifyOtpInput, false);
  }
}
