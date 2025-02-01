import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyUserInput {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  otp: string;
}
