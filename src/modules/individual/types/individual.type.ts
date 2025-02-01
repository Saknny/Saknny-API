import { UserVerificationCodeUseCaseEnum } from '../../user/enums/user.enum';
import { DeviceEnum } from '../enums/individual.enum';
import { Individual } from '@src/modules/individual/entities/individual.entity';

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
  user: Individual;
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
