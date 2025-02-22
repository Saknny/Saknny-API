import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
  DeepPartial,
} from 'typeorm';
import { User } from '@src/modules/user/entities/user.entity';
import { Apartment } from '@src/modules/apartment/entities/apartment.entity/apartment.entity';
import { Student } from '@src/modules/student/entities/student.entity';
import { BaseModel } from '@src/libs/database/base.model';

@Entity()
export class FavoriteList extends BaseModel {
  constructor(input?: DeepPartial<FavoriteList>) {
    super(input);
  }

  @Column()
  name: string;

  @Column({ nullable: true })
  studentId: string;

  @ManyToOne(() => Student, (Student) => Student.favoriteLists, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @OneToMany(() => Apartment, (apartment) => apartment.favoriteList)
  apartments: Apartment[];
}
