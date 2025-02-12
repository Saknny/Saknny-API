import { IsString, IsUrl } from 'class-validator';

export class CompleteStudentProfileInput {
  @IsString()
  bio: string;

  @IsUrl()
  socialAccount: string;
}
