import { Expose } from 'class-transformer';
import { FCMTokenStatusEnum } from '../../enums/fcm-token.enum';

export class FCMResponse {
  @Expose()
  fcmTokenString: string;

  @Expose()
  status: FCMTokenStatusEnum;
}
