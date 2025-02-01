import { Column, DeepPartial, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseModel } from '../../../libs/database/base.model';
import { Job } from './job.entity';

@Entity()
export class JobCategory extends BaseModel {
  constructor(input?: DeepPartial<JobCategory>) {
    super(input);
  }

  @Column({ type: 'text' })
  title: string;

  @ManyToMany(() => Job)
  @JoinTable()
  jobs: Job[];
}
