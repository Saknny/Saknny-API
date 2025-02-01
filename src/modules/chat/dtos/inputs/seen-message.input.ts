import { IsString } from 'class-validator';

export class SeenMessageInput {
  @IsString()
  messageId: string;
}
