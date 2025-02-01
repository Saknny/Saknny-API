import { LangEnum } from '../enums/language-code.enum';
import { UserVerificationCodeUseCaseEnum } from '../../modules/user/enums/user.enum';

const templateName = [
  UserVerificationCodeUseCaseEnum.ACCOUNT_VERIFICATION,
  UserVerificationCodeUseCaseEnum.PASSWORD_RESET,
] as const;

export const defaultSubject = {
  [templateName[0]]: 'Models Account Verification',
  [templateName[1]]: 'Models Password Reset',
};

export type templateNameAsType = typeof templateName;

type sharedDataOptions = {
  firstName?: string;
};
interface IEmailVerification extends sharedDataOptions {
  template: templateNameAsType[0];
  verificationCode: string;
}
interface IPasswordReset extends sharedDataOptions {
  template: templateNameAsType[1];
  verificationCode: string;
}

export type mjmlType = IEmailVerification | IPasswordReset;

export interface MailDetails {
  from?: string;
  to: string | string[];
  subject: string;
  html?: string;
  lang?: LangEnum;
  mjml: mjmlType;
}

export interface Attachment {
  filename: string;
  path?: string;
  content?: Buffer | string;
  contentType?: string;
  encoding?: string;
}

export type FromInput = {
  mail: string;
  password: string;
};

export interface IMailService {
  send(input: MailDetails): Promise<void>;
}
