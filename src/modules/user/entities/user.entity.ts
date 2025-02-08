import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseModel } from '../../../libs/database/base.model';
import { LangEnum } from '../../../libs/enums/language-code.enum';
import { DeepPartial } from '../../../libs/types/deep-partial.type';
import { ChatUser } from '../../chat/entities/chat-user.entity';
import { Chat } from '../../chat/entities/chat.entity';
import { Message } from '../../chat/entities/message.entity';
import { FCMToken } from '../../fcm-token/entities/fcm-token.entity';
import { Student } from '@src/modules/individual/entities/student.entity';
import { Notification } from '../../notification/entities/notification.entity';
import { NotificationStatus } from '../../notification/entities/notificationStatus.entity';
import { Provider } from '@src/modules/organization/entities/provider.entity';
import { Otp } from '../../otp/entities/otp.entity';
import { Profile } from '../../profile/entities/profile.entity';
import { SecurityGroup } from '../../security-group/entities/security-group.entity';
import { UserRoleEnum } from '../enums/user.enum';

@Entity()
export class User extends BaseModel {
  constructor(input?: DeepPartial<User>) {
    super(input);
  }

  @Column({
    unique: true,
    nullable: true,
    transformer: {
      from: (val: string) => (val ? val.toLowerCase() : val),
      to: (val: string) => val,
    },
  })
  verifiedEmail: string;

  @Column({
    nullable: true,
    transformer: {
      from: (val: string) => (val ? val.toLowerCase() : val),
      to: (val: string) => val,
    },
  })
  unVerifiedEmail?: string;

  @Column()
  password: string;

  @Column({ enum: UserRoleEnum })
  role: UserRoleEnum;

  @Column({ default: false })
  isBlocked?: boolean;

  @Column({ nullable: true })
  lastSeenAt?: Date;

  @Column({ enum: LangEnum, default: LangEnum.EN })
  favLang: LangEnum;

  @Column({ nullable: true })
  securityGroupId?: string;

  @ManyToOne(() => SecurityGroup, { onDelete: 'SET NULL' })
  securityGroup?: SecurityGroup;

  @OneToMany(() => Notification, (notification) => notification.receiver)
  notifications?: Array<
    Notification & { NotificationStatus: NotificationStatus }
  >;

  @OneToMany(() => FCMToken, (token) => token.user, { cascade: true })
  fcmTokens: FCMToken[];

  @OneToMany(() => Otp, (otp) => otp.user)
  otps: Otp[];

  @OneToOne(() => Provider, (org) => org.user, { eager: true })
  provider: Provider;

  @OneToOne(() => Student, (Student) => Student.user, { eager: true })
  student: Student;

  @OneToMany(() => ChatUser, (chatUser) => chatUser.user)
  chatUsers: ChatUser[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @ManyToMany(() => Chat, (chat) => chat.users)
  chats: Chat[];

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;
}
