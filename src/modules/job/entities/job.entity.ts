import {
  Column,
  DeepPartial,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseModel } from '../../../libs/database/base.model';
import {
  CareerLevelEnum,
  DurationPrefixEnum,
  EducationLevelEnum,
  JobStatusEnum,
} from '../enums/job.enum';
import { IsEnum, IsNumber } from 'class-validator';
import { Expose } from 'class-transformer';
import { Organization } from '../../organization/entities/organization.entity';
import { IndividualRoleEnum } from '../../individual/enums/individual.enum';
import { Tag } from '../../tag/entities/tag.entity';
import { JobRequest } from '../../request/entities/request.entity';
import { Review } from './review.entity';
import { Individual } from '../../individual/entities/individual.entity';

export class JobRequiredExperience {
  @Expose()
  @IsNumber()
  minimum: number;

  @Expose()
  @IsNumber()
  maximum: number;
}

export class JobDuration {
  @Expose()
  @IsNumber()
  minimum: number;

  @Expose()
  @IsEnum(DurationPrefixEnum)
  minimumPrefix: DurationPrefixEnum;

  @Expose()
  @IsNumber()
  maximum: number;

  @Expose()
  @IsEnum(DurationPrefixEnum)
  maximumPrefix: DurationPrefixEnum;
}

@Entity()
export class Job extends BaseModel {
  constructor(input?: DeepPartial<Job>) {
    super(input);
  }

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  requirements: string;

  @Column({ type: 'text' })
  location: string;

  @Column({ type: 'float' })
  salary: number;

  @Column({ enum: CareerLevelEnum })
  careerLevel: CareerLevelEnum;

  @Column({ type: 'jsonb' })
  requiredExperience: JobRequiredExperience;

  @Column({ type: 'jsonb' })
  jobDuration: JobDuration;

  @Column({ enum: EducationLevelEnum })
  educationLevel: EducationLevelEnum;

  @ManyToMany(() => Tag, (tag) => tag.jobs, { eager: true })
  tags: Tag[];

  @Column({ enum: IndividualRoleEnum })
  jobCategory: IndividualRoleEnum;

  @ManyToOne(() => Organization, (org) => org.jobs, { onDelete: 'CASCADE' })
  organization: Organization;

  @Column()
  organizationId: string;

  @Column({ enum: JobStatusEnum, default: JobStatusEnum.OPEN })
  jobStatus: JobStatusEnum;

  @ManyToOne(() => Individual, (individual) => individual.jobs)
  individual: Individual;

  @OneToMany(() => JobRequest, (jobRequest) => jobRequest.job)
  jobRequests: JobRequest[];

  @OneToMany(() => Review, (review) => review.job)
  reviews: Review[];

  @Column({ type: 'tsvector', nullable: true })
  jobSearchVector: string;

  // @Column({ enum: JobTypeEnum })
  // jobType: JobTypeEnum;

  // @ManyToMany(() => JobCategory, (category) => category.jobs, { eager: true })
  // jobCategories: JobCategory[];
}
