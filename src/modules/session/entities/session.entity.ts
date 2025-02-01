import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseModel } from '../../../libs/database/base.model';
import { SessionStatusEnum } from '../enums/session.enum';
import { FCMToken } from '../../fcm-token/entities/fcm-token.entity';
import { User } from '../../user/entities/user.entity';
@Entity()
export class Session extends BaseModel {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @OneToOne(() => FCMToken, (token) => token.session, { onDelete: 'CASCADE' })
  @JoinColumn()
  fcmToken: FCMToken;

  @Column({
    enum: SessionStatusEnum,
    default: SessionStatusEnum.ACTIVE,
  })
  status: SessionStatusEnum;
}
