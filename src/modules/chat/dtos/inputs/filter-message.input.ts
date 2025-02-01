import { IsString } from 'class-validator';

export class MessageIdInput {
  @IsString()
  messageId: string;
}

export class MessageFilterInput {
  @IsString()
  chatId: string;

  @IsString()
  messageId: string;
}
