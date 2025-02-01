import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { OtpUseCaseEnum } from '../../enums/otp.enum';

export class VerifyOtpInput {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  otp: string;

  @IsNotEmpty()
  @IsEnum(OtpUseCaseEnum)
  useCase: OtpUseCaseEnum;
}
