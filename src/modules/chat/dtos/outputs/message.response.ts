import { Expose, Type } from 'class-transformer';
import { ChatUserResponse } from './chatUser.response';

export class MessageStatusResponse {
  @Expose()
  receiver: ChatUserResponse;

  @Expose()
  @Type(() => Date)
  seenAt: Date;

  @Expose()
  @Type(() => Date)
  deliveredAt: Date;
}

export class GetMessageResponse {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  @Type(() => ChatUserResponse)
  sender: ChatUserResponse;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class GetMessageWithStatusResponse extends GetMessageResponse {
  @Expose()
  @Type(() => MessageStatusResponse)
  messageStatus: MessageStatusResponse[];
}

export class CreatedMessageResponse {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  chatId: string;

  @Expose()
  sender: ChatUserResponse;
}

export class DeliveredMessageResponse {
  @Expose()
  id: string;

  @Expose()
  chatId: string;

  @Expose()
  deliveredAt: Date;
}

export class SeenMessageResponse {
  @Expose()
  id: string;

  @Expose()
  chatId: string;

  @Expose()
  seenAt: Date;
}

export class UpdatedMessageResponse {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  chatId: string;

  @Expose()
  sender: ChatUserResponse;

  @Expose()
  updatedAt: Date;
}

export class DeletedMessageResponse {
  @Expose()
  id: string;

  @Expose()
  chatId: string;

  @Expose()
  sender: ChatUserResponse;

  @Expose()
  deletedAt: Date;
}
