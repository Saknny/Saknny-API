import { Expose } from 'class-transformer';

export class TypingStatusResponse {
  @Expose()
  chatId: string;

  @Expose()
  isTyping: boolean;
}
