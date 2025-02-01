import { Expose, Transform } from 'class-transformer';
import { UserRoleEnum } from '../../../user/enums/user.enum';

export class ChatUserResponse {
  @Expose()
  id: string;

  @Expose()
  @Transform(({ obj }) => {
    return obj.role === UserRoleEnum.INDIVIDUAL
      ? obj.individual?.fullName
      : obj.organization?.name;
  })
  name: string;

  @Expose()
  @Transform(({ obj }) =>
    obj.role === UserRoleEnum.INDIVIDUAL
      ? obj.individual?.profilePicture
      : obj.organization?.logo,
  )
  profilePicture: string;

  @Expose()
  @Transform(({ obj }) => {
    const lastSeenAt = obj.lastSeenAt
      ? new Date(obj.lastSeenAt).getTime()
      : null;
    const oneMinuteAgo = Date.now() - 1000 * 60;
    return lastSeenAt >= oneMinuteAgo;
  })
  isOnline: boolean;
}
