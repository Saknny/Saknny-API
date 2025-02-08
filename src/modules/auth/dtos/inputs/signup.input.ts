import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRoleEnum } from '@modules/user/enums/user.enum';
import { TextValidator } from '@libs/utils/validators/text.validator';
import { passwordRegex } from '@libs/regex/lang.regex';
import { ErrorCodeEnum } from '@libs/application/exceptions/error-code.enum';

export class SignupInput {
  @ValidateIf((o) => o.role === UserRoleEnum.STUDENT)
  @IsString()
  @MinLength(2)
  @MaxLength(15)
  firstName: string;

  @ValidateIf((o) => o.role === UserRoleEnum.STUDENT)
  @IsString()
  @MinLength(2)
  @MaxLength(15)
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase(), { toClassOnly: true })
  email: string;

  @TextValidator({
    minLength: {
      value: 8,
      message: ErrorCodeEnum[ErrorCodeEnum.PASSWORD_LENGTH],
    },
    maxLength: {
      value: 25,
      message: ErrorCodeEnum[ErrorCodeEnum.PASSWORD_LENGTH],
    },
    regexPattern: {
      value: passwordRegex,
      message: ErrorCodeEnum[ErrorCodeEnum.PASSWORD_PATTERN],
    },
    allowed: ['EN', 'NUM', 'SPECIAL'],
    defaultMessage: ErrorCodeEnum[ErrorCodeEnum.INVALID_PASSWORD],
  })
  password: string;

  @IsNotEmpty()
  @IsEnum(UserRoleEnum)
  role: UserRoleEnum = UserRoleEnum.STUDENT;
}
