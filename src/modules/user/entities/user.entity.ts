import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  ManyToMany,
} from 'typeorm';
import { BaseModel } from '../../../libs/database/base.model';
import { DeepPartial } from '../../../libs/types/deep-partial.type';
import { SecurityGroup } from '../../security-group/entities/security-group.entity';
import { FCMToken } from '../../fcm-token/entities/fcm-token.entity';
import { NotificationStatus } from '../../notification/entities/notificationStatus.entity';
import { Notification } from '../../notification/entities/notification.entity';
import { UserRoleEnum } from '../enums/user.enum';
import { Otp } from '../../otp/entities/otp.entity';
import { Individual } from '../../individual/entities/individual.entity';
import { Organization } from '../../organization/entities/organization.entity';
import { LangEnum } from '../../../libs/enums/language-code.enum';
import { Message } from '../../chat/entities/message.entity';
import { ChatUser } from '../../chat/entities/chat-user.entity';
import { Chat } from '../../chat/entities/chat.entity';
import { Profile } from '../../profile/entities/profile.entity';

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

  @OneToOne(() => Organization, (org) => org.user, { eager: true })
  organization: Organization;

  @OneToOne(() => Individual, (individual) => individual.user, { eager: true })
  individual: Individual;

  @OneToMany(() => ChatUser, (chatUser) => chatUser.user)
  chatUsers: ChatUser[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @ManyToMany(() => Chat, (chat) => chat.users)
  chats: Chat[];

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;
}
