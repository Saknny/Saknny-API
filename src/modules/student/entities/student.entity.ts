import { Expose, Type } from 'class-transformer';
import { IsDate, IsString, Validate } from 'class-validator';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseModel } from '../../../libs/database/base.model';
import { DeepPartial } from '../../../libs/types/deep-partial.type';
import { IsEndDateAfterStartDate } from '../../../libs/utils/validators/is-endDate-after-startDate';
import { User } from '../../user/entities/user.entity';
import { Bed } from '@src/modules/bed/entities/bed.entity/bed.entity';
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
  gender: string;

  @Column({ nullable: true })
  facebook: string;

  @Column({ nullable: true })
  instagram: string;

  @Column({ nullable: true })
  linkedin: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  university: string;

  @Column({ type: Boolean, default: false })
  isTrusted: boolean;


  @Column({ type: Boolean, default: false  })
  isReviewed: boolean;

  @Column({ type: 'varchar', nullable: true })  // Store idCard as binary
  idCard: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  major: string;

  @Column({ type: 'boolean', default: false , nullable: true  })
  smoking: boolean;

  @Column({ nullable: true })
  level: string;

  @Column({ type: 'boolean', default: false  , nullable: true })
  socialPerson: boolean;

  @Column('simple-array', { nullable: true })
  hobbies: string[];

  @Column()
  userId: string;

  @OneToOne(() => User, (user) => user.student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToOne(() => Bed, (bed) => bed.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bedId' })
  bed: Bed;
}
