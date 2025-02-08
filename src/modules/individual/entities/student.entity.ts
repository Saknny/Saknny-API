import { Expose, Type } from 'class-transformer';
import { IsDate, IsString, Validate } from 'class-validator';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseModel } from '../../../libs/database/base.model';
import { DeepPartial } from '../../../libs/types/deep-partial.type';
import { IsEndDateAfterStartDate } from '../../../libs/utils/validators/is-endDate-after-startDate';
import { User } from '../../user/entities/user.entity';
@Entity()
export class Student extends BaseModel {
  constructor(input?: DeepPartial<Student>) {
    super(input);
  }

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: Boolean, default: true })
  isVisible: boolean;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  socialAccount: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: Boolean, default: false })
  onboardingCompleted: boolean;

  @Column()
  userId: string;

  @OneToOne(() => User, (user) => user.student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
