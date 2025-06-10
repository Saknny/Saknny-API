import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, DeepPartial } from 'typeorm';
import { Major } from '../major/major.entity';
import { BaseModel } from '@src/libs/database/base.model';

@Entity()
export class Level extends BaseModel {
  constructor(input?: DeepPartial<Level>) {
    super(input);
  }

  @Column()
  name: string;

  @ManyToOne(() => Major, major => major.levels)
  major: Major;
}
