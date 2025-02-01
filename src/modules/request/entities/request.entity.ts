import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseModel } from '../../../libs/database/base.model';
import { DeepPartial } from '../../../libs/types/deep-partial.type';
import { RequestStatusEnum } from '../enums/request.enum';
import { Individual } from '../../individual/entities/individual.entity';
import { Job } from '../../job/entities/job.entity';

@Entity()
export class JobRequest extends BaseModel {
  constructor(input?: DeepPartial<JobRequest>) {
    super(input);
  }

  @Column({ enum: RequestStatusEnum, default: RequestStatusEnum.PENDING })
  requestStatus: RequestStatusEnum;

  @ManyToOne(() => Individual, (individual) => individual.jobRequests)
  individual: Individual;

  @ManyToOne(() => Job, (job) => job.jobRequests)
  job: Job;
}
