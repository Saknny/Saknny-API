import { UserVerificationCodeUseCaseEnum } from '../../user/enums/user.enum';
import { DeviceEnum } from '../enums/student.enum';
import { Student } from '../entities/student.entity';

export class FcmTokensType {
  android?: string;
  ios?: string;
  desktop?: string;
}

export interface FcmTokenTransformerInput {
  fcmToken?: string;
  device?: DeviceEnum;
  userSavedFcmTokens?: FcmTokensType;
}

export interface VerificationCodeAndExpirationDate {
  verificationCode: string;
  expiryDateAfterOneHour: Date;
}

export interface ValidVerificationCodeOrErrorInput {
  user: Student;
  verificationCode: string;
  useCase: UserVerificationCodeUseCaseEnum;
}

export interface UserByPhoneBasedOnUseCaseOrErrorInput {
  phone: string;
  useCase: UserVerificationCodeUseCaseEnum;
}

export interface UserByEmailBasedOnUseCaseOrErrorInput {
  email: string;
  useCase: UserVerificationCodeUseCaseEnum;
}
