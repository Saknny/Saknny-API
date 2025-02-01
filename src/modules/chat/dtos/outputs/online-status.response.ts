import { Expose } from 'class-transformer';

export class OnlineStatusResponse {
  @Expose()
  chatId: string;

  @Expose()
  isOnline: boolean;
}
