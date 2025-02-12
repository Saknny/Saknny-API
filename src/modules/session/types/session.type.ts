import { FCMTokenInput } from '../../fcm-token/types/fcm-token.Types';
import { Student } from '@src/modules/student/entities/student.entity';

export interface sessionInputType {
  user: Student;
  FCMtoken: FCMTokenInput;
}
