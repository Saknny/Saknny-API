import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from '../../user/entities/user.entity';
import { BaseModel } from '../../../libs/database/base.model';

@Entity('chat_users_user')
export class ChatUser extends BaseModel {
  @Column()
  chatId: string;

  @ManyToOne(() => Chat, (chat) => chat.chatUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatId' })
  chat: Chat;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.chatUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
