import { Expose, Transform } from 'class-transformer';
import { UserRoleEnum } from '../../../user/enums/user.enum';

export class ChatUserResponse {
  @Expose()
  id: string;

  @Expose()
  @Transform(({ obj }) => {
    return obj.role === UserRoleEnum.STUDENT
      ? obj.student?.fullName
      : obj.provider?.name;
  })
  name: string;

  @Expose()
  @Transform(({ obj }) =>
    obj.role === UserRoleEnum.STUDENT
      ? obj.student?.profilePicture
      : obj.provider?.logo,
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
