import { Column, DeepPartial, Entity, ManyToOne } from 'typeorm';
import { BaseModel } from '../../../libs/database/base.model';
import { OtpUseCaseEnum } from '../enums/otp.enum';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Otp extends BaseModel {
  constructor(input?: DeepPartial<Otp>) {
    super(input);
  }

  @Column({ type: 'varchar', length: 255 })
  otp: string;

  @Column({ type: 'varchar', length: 255 })
  useCase: OtpUseCaseEnum;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.otps, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
