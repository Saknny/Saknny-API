import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeepPartial } from 'typeorm';
import { NotificationStatus } from '../../enums/notificationStatus.enum';
import { BaseModel } from '@src/libs/database/base.model';

@Entity('notifications')

export class Notification extends BaseModel {
  constructor(input?: DeepPartial<Notification>) {
    super(input);
  }


  @Column()
  userId: string;

  @Column({type:'text',nullable: true})
  type: string;

  @Column('text')
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD
  })
  status: NotificationStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  relatedEntityId?: string;
}
