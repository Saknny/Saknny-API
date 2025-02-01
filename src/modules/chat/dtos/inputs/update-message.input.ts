import { IsString } from 'class-validator';

export class UpdateMessageInput {
  @IsString()
  content: string;
}
