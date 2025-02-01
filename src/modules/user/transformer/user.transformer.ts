import { Injectable } from '@nestjs/common';
import { HelperService } from '@src/libs/utils/helper/helper.service';
import { SignupInput } from '../../auth/dtos/inputs/signup.input';
import { User } from '../entities/user.entity';
import { CompleteUserProfileInput } from '../dtos/inputs/update-user.input';
import { UserRoleEnum } from '../enums/user.enum';
import { BaseHttpException } from '../../../libs/application/exceptions/base-http-exception';
import { ErrorCodeEnum } from '../../../libs/application/exceptions/error-code.enum';

@Injectable()
export class UserTransformer {
  constructor(private readonly helperService: HelperService) {}

  async registerAsUserTransformer(input: SignupInput): Promise<Partial<User>> {
    const { email, password, ...other } = input;

    return {
      ...other,
      unVerifiedEmail: email,
      password: await this.helperService.hashPassword(password),
    };
  }

  validateOnboardingDataByRole(role: string, data: CompleteUserProfileInput) {
    const profile =
      role === UserRoleEnum.INDIVIDUAL && data.individualProfile
        ? { ...data.individualProfile, onboardingCompleted: true }
        : role === UserRoleEnum.ORGANIZATION && data.organizationProfile
          ? { ...data.organizationProfile, onboardingCompleted: true }
          : null;

    if (profile) return profile;

    const error =
      role === UserRoleEnum.INDIVIDUAL
        ? ErrorCodeEnum.INDIVIDUAL_PROFILE_REQUIRED
        : ErrorCodeEnum.ORGANIZATION_PROFILE_REQUIRED;
    throw new BaseHttpException(error);
  }
}
