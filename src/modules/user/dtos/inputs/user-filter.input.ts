import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UsernameInput {
  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  username: string;
}

export class UserEmailInput {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}

export class UserIdInput {
  @IsNotEmpty()
  @IsString()
  userId: string;
}
