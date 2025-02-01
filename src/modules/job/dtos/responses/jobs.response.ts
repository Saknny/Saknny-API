import { Expose, Type } from 'class-transformer';
import { JobDuration, JobRequiredExperience } from '../../entities/job.entity';
import {
  OrganizationShortInfo,
  OrganizationWithExposeIdFullResponse,
} from '../../../organization/dtos/responses/organization.response';
import { CareerLevelEnum, EducationLevelEnum } from '../../enums/job.enum';
import { IndividualRoleEnum } from '../../../individual/enums/individual.enum';

export class JobShortResponse {
  @Expose()
  @Type(() => OrganizationShortInfo)
  organization: OrganizationShortInfo;

  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  location: string;

  @Expose()
  salary: number;

  @Expose()
  @Type(() => JobDuration)
  jobDuration: JobDuration;

  @Expose()
  tags: string[];

  @Expose()
  createdAt: Date;
}

export class JobFullResponse extends JobShortResponse {
  @Expose()
  description: string;

  @Expose()
  requirements: string;

  @Expose()
  educationLevel: EducationLevelEnum;

  @Expose()
  careerLevel: CareerLevelEnum;

  @Expose()
  jobCategory: IndividualRoleEnum;

  @Expose()
  requiredExperience: JobRequiredExperience;

  @Expose()
  @Type(() => OrganizationWithExposeIdFullResponse)
  organization: OrganizationWithExposeIdFullResponse;
}
