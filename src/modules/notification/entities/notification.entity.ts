import { Entity, Column, ManyToOne } from 'typeorm';
import { FCMToken } from '../../fcm-token/entities/fcm-token.entity';
import { BaseModel } from '../../../libs/database/base.model';
import { NotificationTypeEnum } from '../enums/notification.enum';
import { NotificationStatus } from './notificationStatus.entity';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'notifications' })
export class Notification extends BaseModel {
  @Column({ nullable: true })
  fcmTokenId: string;

  @ManyToOne(() => FCMToken, { onDelete: 'CASCADE' })
  fcmToken: FCMToken;

  @Column({ nullable: true })
  entityId?: string;

  @Column({  enum: NotificationTypeEnum })
  type: NotificationTypeEnum;

  @Column({ type: 'text', nullable: true })
  thumbnail?: string;

  @Column({ type: 'text' })
  enTitle: string;

  @Column({ type: 'text', nullable: true })
  arTitle: string;

  @Column({ type: 'text' })
  enBody: string;

  @Column({ type: 'text', nullable: true })
  arBody: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  sender?: User;

  @ManyToOne(() => User, (user) => user.notifications)
  receiver: User & { NotificationStatus: NotificationStatus };
}
