import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseModel } from '../../../libs/database/base.model';
import { User } from '../../user/entities/user.entity';
import { DeepPartial } from '../../../libs/types/deep-partial.type';
import { Chat } from './chat.entity';
import { MessageStatus } from './message.status.entity';
import { messageTypeEnum } from '../enums/message.enum';

@Entity()
export class Message extends BaseModel {
  constructor(input?: DeepPartial<Message>) {
    super(input);
  }

  @Column({ nullable: false })
  senderId: string;

  @ManyToOne(() => User, (user) => user.messages, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  chatId: string;

  @ManyToOne(() => Chat, (chat) => chat.messages, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'chatId' })
  chat: Chat;

  @Column({ type: 'text' })
  content: string;

  @Column({ enum: messageTypeEnum, default: messageTypeEnum.TEXT })
  messageType?: messageTypeEnum;

  @OneToMany(() => MessageStatus, (messageStatus) => messageStatus.message, {
    eager: true,
  })
  messageStatus: MessageStatus[];
}
