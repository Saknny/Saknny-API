import { Entity, PrimaryGeneratedColumn, Column, OneToMany, DeepPartial } from 'typeorm';
import { Major } from '../major/major.entity'; 
import { BaseModel } from '@src/libs/database/base.model';

@Entity()
export class University extends BaseModel {
  constructor(input?: DeepPartial<University>) {
    super(input);
  }

  @Column()
  name: string;

  @OneToMany(() => Major, major => major.university)
  majors: Major[];
}
