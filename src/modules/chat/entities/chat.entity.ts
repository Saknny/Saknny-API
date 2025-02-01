import { Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { BaseModel } from '../../../libs/database/base.model';
import { DeepPartial } from '../../../libs/types/deep-partial.type';
import { Message } from './message.entity';
import { ChatUser } from './chat-user.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Chat extends BaseModel {
  constructor(input?: DeepPartial<Chat>) {
    super(input);
  }

  @OneToMany(() => ChatUser, (chatUser) => chatUser.chat)
  chatUsers: ChatUser[];

  @ManyToMany(() => User, (user) => user.chats)
  @JoinTable({ name: 'chat_users_user', synchronize: false })
  users: User[];

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}
