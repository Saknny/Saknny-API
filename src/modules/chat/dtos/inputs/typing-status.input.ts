import { IsBoolean } from 'class-validator';

export class TypingStatusInput {
  @IsBoolean()
  isTyping: boolean;
}
