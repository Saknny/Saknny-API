import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CompleteStudentProfileInput } from '@src/modules/student/dtos/inputs/student.input';
import { CompleteProviderProfileInput } from '@src/modules/provider/dtos/inputs/complete-profile.input';
import { Type } from 'class-transformer';

export class CompleteUserProfileInput {
  @IsOptional()
  @ValidateNested()
  @Type(() => CompleteStudentProfileInput)
  studentProfile: CompleteStudentProfileInput;

  @IsOptional()
  @ValidateNested()
  @Type(() => CompleteProviderProfileInput)
  providerProfile: CompleteProviderProfileInput;
}

export class UpdateUserInfo {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(15)
  firstName: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(15)
  lastName: string;
}

export class CurrentUserUpdateInput {
  @IsOptional()
  @MinLength(6)
  @MaxLength(30)
  @IsString()
  password: string;
}
