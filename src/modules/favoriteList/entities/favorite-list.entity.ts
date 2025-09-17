import { BaseModel } from '@src/libs/database/base.model';
import { DeepPartial } from '@src/libs/types/deep-partial.type';
import { Student } from '@src/modules/student/entities/student.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { FavoriteApartment } from './favorite-apartment.entity';

@Entity()
export class Favorite extends BaseModel {
  constructor(input?: DeepPartial<Favorite>) {
    super(input);
  }

  @Column()
  name: string;

  @ManyToOne(() => Student, (student) => student.favorites, {
    onDelete: 'CASCADE',
  })
  student: Student;

  @OneToMany(() => FavoriteApartment, (fp) => fp.favorite, { cascade: true })
  favoriteApartments: FavoriteApartment[];
}
