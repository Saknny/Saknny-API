import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { OtpUseCaseEnum } from '../../enums/otp.enum';

export class SendOtpInput {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsEnum(OtpUseCaseEnum)
  useCase: OtpUseCaseEnum;
}
