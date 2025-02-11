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


  @Column({ nullable: true })
  facebook: string;

  @Column({ nullable: true })
  instagram: string;

  @Column({ nullable: true })
  linkedin: string;


  @Column({ nullable: true })
  location: string;

  @Column({ type: Boolean, default: false })
  onboardingCompleted: boolean;
  @Column({ nullable: true })
  idCardImageUrl: string;

  @Column({ nullable: true })
  profilePictureUrl: string;

  @Column({ nullable: true })
  major: string;

  @Column({ type: 'boolean', default: false })
  smoking: boolean;

  @Column({ type: 'enum', enum: [1, 2, 3, 4, 5, 6, 'master'], nullable: true })
  level: number | 'master';

  @Column({ type: 'boolean', default: false })
  socialPerson: boolean;

  @Column({ type: 'text', nullable: true })
  hobbies: string;

  @Column()
  userId: string;

  @OneToOne(() => User, (user) => user.student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
