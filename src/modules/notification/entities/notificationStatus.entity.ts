import { Entity, Column, ManyToOne } from 'typeorm';
import { Individual } from '@src/modules/individual/entities/individual.entity';
import { Notification } from './notification.entity';
import { BaseModel } from '@src/libs/database/base.model';

@Entity()
export class NotificationStatus extends BaseModel {
  @Column()
  receiverId: string;

  @ManyToOne(() => Individual, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  receiver: Individual;

  @Column()
  notificationId: string;

  @ManyToOne(() => Notification, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  notification: Notification;

  @Column({ type: 'timestamp', nullable: true })
  seenAt?: Date;
}
