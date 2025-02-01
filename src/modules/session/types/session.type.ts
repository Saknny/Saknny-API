import { FCMTokenInput } from '../../fcm-token/types/fcm-token.Types';
import { Individual } from '../../individual/entities/individual.entity';

export interface sessionInputType {
  user: Individual;
  FCMtoken: FCMTokenInput;
}
