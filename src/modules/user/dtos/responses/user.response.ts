import { Expose, Transform } from 'class-transformer';
import { FCMTokenStatusEnum } from '../../../fcm-token/enums/fcm-token.enum';
import { UserRoleEnum } from '../../enums/user.enum';
import { StudentResponse } from '@src/modules/individual/dtos/responses/student.response';
import { ProviderResponse } from '@src/modules/organization/dtos/responses/provider.response';

export class UserResponse {
  @Expose()
  id: string;

  @Expose()
  role: UserRoleEnum;

  @Expose()
  verifiedEmail: string;

  @Expose()
  unVerifiedEmail: string;

  @Expose()
  @Transform(({ obj }) => obj.session?.fcmToken?.fcmTokenString)
  fcmToken: string;

  @Expose()
  @Transform(({ obj }) => obj.session?.fcmToken?.status)
  fcmStatus: FCMTokenStatusEnum;

  @Expose()
  @Transform(({ obj }) => {
    const { role, provider, student } = obj;
    const roleToOnboardingMapping = {
      [UserRoleEnum.STUDENT]: student?.onboardingCompleted,
      [UserRoleEnum.PROVIDER]: provider?.onboardingCompleted,
    };
    return roleToOnboardingMapping[role] ?? false;
  })
  onboardingCompleted: boolean;

  @Expose()
  student: StudentResponse;

  @Expose()
  provider: ProviderResponse;
}

export class UserIdResponse {
  @Expose()
  id: string;
}
