import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from '../../../libs/database/base.model';
import { User } from '../../user/entities/user.entity';
import { DeepPartial } from '../../../libs/types/deep-partial.type';
import { Message } from './message.entity';

@Entity()
export class MessageStatus extends BaseModel {
  constructor(input?: DeepPartial<MessageStatus>) {
    super(input);
  }

  @ManyToOne(() => Message, (message) => message.messageStatus, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @Column({ nullable: false })
  messageId: string;

  @ManyToOne(() => User, {
    eager: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column({ nullable: false })
  receiverId: string;

  @Column({ type: 'timestamp', nullable: true })
  seenAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;
}
