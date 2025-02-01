import { Column, DeepPartial, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseModel } from '../../../libs/database/base.model';
import { Job } from '../../job/entities/job.entity';

@Entity()
export class Tag extends BaseModel {
  constructor(input?: DeepPartial<Tag>) {
    super(input);
  }

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: Boolean, default: false })
  isApproved: boolean;

  @ManyToMany(() => Job, (Job) => Job.tags)
  @JoinTable()
  jobs: Job[];
}
