import { FCMTokenInput } from '../../fcm-token/types/fcm-token.Types';
import { Student } from '@src/modules/individual/entities/student.entity';

export interface sessionInputType {
  user: Student;
  FCMtoken: FCMTokenInput;
}
