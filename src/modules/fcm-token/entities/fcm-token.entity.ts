import { Entity, Column, ManyToOne, OneToOne } from 'typeorm';
import { FCMTokenStatusEnum } from '../enums/fcm-token.enum';
import { BaseModel } from '../../../libs/database/base.model';
import { DeviceEnum } from '@src/modules/individual/enums/student.enum';
import { Session } from '../../session/entities/session.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class FCMToken extends BaseModel {
  @ManyToOne(() => User, (user) => user.fcmTokens, {
    onDelete: 'CASCADE',
  })
  user: User;

  @OneToOne(() => Session, (session) => session.fcmToken, {
    onDelete: 'CASCADE',
  })
  session: Session;

  @Column()
  deviceType: DeviceEnum;

  @Column()
  fcmTokenString: string;

  @Column({
    enum: FCMTokenStatusEnum,
    default: FCMTokenStatusEnum.ACTIVE,
  })
  status: FCMTokenStatusEnum;
}
