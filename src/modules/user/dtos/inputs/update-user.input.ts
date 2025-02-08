import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CompleteStudentProfileInput } from '@src/modules/individual/dtos/inputs/student.input';
import { CompleteOrganizationProfileInput } from '../../../organization/dtos/inputs/update-organization.input';
import { Type } from 'class-transformer';

export class CompleteUserProfileInput {
  @IsOptional()
  @ValidateNested()
  @Type(() => CompleteStudentProfileInput)
  studentProfile: CompleteStudentProfileInput;

  @IsOptional()
  @ValidateNested()
  @Type(() => CompleteOrganizationProfileInput)
  organizationProfile: CompleteOrganizationProfileInput;
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
