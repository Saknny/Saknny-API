import { Expose } from 'class-transformer';
import { SessionStatusEnum } from '../../enums/session.enum';
import { FCMResponse } from '../../../fcm-token/dtos/responses/fcm-token.response';

export class SessionResponse {
  @Expose()
  fcmToken: FCMResponse;

  @Expose()
  status: SessionStatusEnum;
}
