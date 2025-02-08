import { Expose, Transform } from 'class-transformer';
import { FCMTokenStatusEnum } from '../../../fcm-token/enums/fcm-token.enum';
import { UserRoleEnum } from '../../enums/user.enum';
import { StudentResponse } from '@src/modules/individual/dtos/responses/student.response';
import { OrganizationResponse } from '../../../organization/dtos/responses/organization.response';

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
    const { role, organization, student } = obj;
    const roleToOnboardingMapping = {
      [UserRoleEnum.STUDENT]: student?.onboardingCompleted,
      [UserRoleEnum.PROVIDER]: organization?.onboardingCompleted,
    };
    return roleToOnboardingMapping[role] ?? false;
  })
  onboardingCompleted: boolean;

  @Expose()
  student: StudentResponse;

  @Expose()
  organization: OrganizationResponse;
}

export class UserIdResponse {
  @Expose()
  id: string;
}
