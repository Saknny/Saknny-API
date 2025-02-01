import { IsEnum } from 'class-validator';

export enum NotificationStatusEnumInput {
  ENABLE = 'ENABLE',
  DISABLE = 'DISABLE',
}

export class NotificationStatusInput {
  @IsEnum(NotificationStatusEnumInput, {
    message: 'Status either ENABLE or DISABLE',
  })
  status: NotificationStatusEnumInput;
}
