import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { UpdateUserInfo } from '../../../user/dtos/inputs/update-user.input';

export class UpdateStudentInput {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserInfo)
  accountInfo: UpdateUserInfo;

  @IsOptional()
  @IsBoolean()
  isVisible: boolean;

  @IsOptional()
  @IsString()
  bio: string;

  @IsOptional()
  @IsUrl()
  socialAccount: string;
}
