import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateEmailInput {
  @IsEmail()
  @IsNotEmpty()
  newEmail: string;

  @IsNotEmpty()
  @IsString()
  otp: string;
}