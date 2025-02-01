import { IsNotEmpty, IsString } from 'class-validator';
import { passwordRegex } from '@libs/regex/lang.regex';
import { ErrorCodeEnum } from '@libs/application/exceptions/error-code.enum';
import { TextValidator } from '@libs/utils/validators/text.validator';

export class UpdatePasswordInput {
    @IsNotEmpty()
    @IsString()
    currentPassword: string; 
  
    @TextValidator({
      minLength: {
        value: 8,
        message: ErrorCodeEnum[ErrorCodeEnum.PASSWORD_LENGTH],
      },
      maxLength: {
        value: 20,
        message: ErrorCodeEnum[ErrorCodeEnum.PASSWORD_LENGTH],
      },
      regexPattern: {
        value: passwordRegex,
        message: ErrorCodeEnum[ErrorCodeEnum.PASSWORD_PATTERN],
      },
      allowed: ['EN', 'NUM', 'SPECIAL'],
      defaultMessage: ErrorCodeEnum[ErrorCodeEnum.INVALID_PASSWORD],
    })
    newPassword: string; 
  
    @IsNotEmpty()
    @IsString()
    otp: string;
  }