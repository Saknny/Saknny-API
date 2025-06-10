import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyUserInput {
  // @IsNotEmpty()
  // @IsString()
  // userId: string;
  @IsNotEmpty()
  @IsEmail()
  email: string;


  @IsNotEmpty()
  @IsString()
  otp: string;
}
