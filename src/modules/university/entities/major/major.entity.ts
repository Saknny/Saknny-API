import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, DeepPartial } from 'typeorm';
import { University } from '../university/university.entity';
import { Level } from '../level/level.entity'; 
import { BaseModel } from '@src/libs/database/base.model';

@Entity()
export class Major extends BaseModel {
  constructor(input?: DeepPartial<Major>) {
    super(input);
  }

  @Column()
  name: string;

  @ManyToOne(() => University, university => university.majors)
  university: University;

  @OneToMany(() => Level, level => level.major)
  levels: Level[];
}
