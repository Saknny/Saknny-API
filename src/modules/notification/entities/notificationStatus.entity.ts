import { Entity, Column, ManyToOne } from 'typeorm';
import { Student } from '@src/modules/student/entities/student.entity';
import { Notification } from './notification.entity';
import { BaseModel } from '@src/libs/database/base.model';

@Entity()
export class NotificationStatus extends BaseModel {
  @Column()
  receiverId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  receiver: Student;

  @Column()
  notificationId: string;

  @ManyToOne(() => Notification, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  notification: Notification;

  @Column({ type: 'timestamp', nullable: true })
  seenAt?: Date;
}
