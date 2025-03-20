import { Bed } from '@src/modules/bed/entities/bed.entity/bed.entity';
import { RentalRequest } from '@src/modules/booking-request/entity/rental-request.entity';
import { Favorite } from '@src/modules/favoriteList/entities/favorite-list.entity';
import { Status } from '@src/modules/request/entities/enum/status.enum';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseModel } from '../../../libs/database/base.model';
import { DeepPartial } from '../../../libs/types/deep-partial.type';
import { User } from '../../user/entities/user.entity';
import { Review } from '@src/modules/review/entities/review.entity';
@Entity()
export class Student extends BaseModel {
  constructor(input?: DeepPartial<Student>) {
    super(input);
  }

  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  status: Status;

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

  @Column({ type: 'varchar', nullable: true }) // Store idCard as binary
  idCard: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  major: string;

  @Column({ type: 'boolean', default: false, nullable: true })
  smoking: boolean;

  @Column({ nullable: true })
  level: string;

  @Column({ type: 'boolean', default: false, nullable: true })
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

  @OneToMany(() => Favorite, (Favorite) => Favorite.student, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  favorites: Favorite[];

  @OneToMany(() => RentalRequest, (request) => request.student)
  rentalRequests: RentalRequest[];

  @OneToMany(() => Review, (review) => review.student)
  reviews: Review[];
}
