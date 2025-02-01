import { IsString } from 'class-validator';

export class sendMessageInput {
  @IsString()
  content: string;
}
