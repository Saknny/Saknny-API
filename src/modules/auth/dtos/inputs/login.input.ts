import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRoleEnum } from '../../../user/enums/user.enum';

export class LoginInput {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toLowerCase(), { toClassOnly: true })
  email: string;

  @MinLength(6)
  @MaxLength(30)
  @IsNotEmpty()
  password: string;

  // @IsEnum(UserRoleEnum)
  // role: UserRoleEnum;
}
