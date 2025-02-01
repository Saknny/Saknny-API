import { NotificationTypeEnum } from '../enums/notification.enum';

export interface NotificationJob {
  inputData: any;
  type: NotificationTypeEnum;
}

export interface NotificationMessage {
  title: string;
  body: string;
}
