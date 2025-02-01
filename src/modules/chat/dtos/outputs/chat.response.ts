import { Expose, plainToInstance, Transform, Type } from 'class-transformer';
import { ChatUserResponse } from './chatUser.response';
import { ChatTypeEnum } from '../../enums/chat.enum';
import { GetMessageResponse } from './message.response';

export class GetChatWithFriendsResponse {
  @Expose()
  id: string;

  @Expose()
  @Type(() => ChatUserResponse)
  friend: ChatUserResponse;

  @Expose()
  @Transform(({ obj }) => {
    if (obj?.users) {
      return obj.users.map((user) =>
        plainToInstance(ChatUserResponse, user, {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        }),
      );
    }
  })
  @Type(() => ChatUserResponse)
  users: ChatUserResponse[];

  @Expose()
  @Type(() => GetMessageResponse)
  latestMessage: GetMessageResponse;

  @Expose()
  unseenMessagesCount: number;

  @Expose()
  type: ChatTypeEnum;
}
