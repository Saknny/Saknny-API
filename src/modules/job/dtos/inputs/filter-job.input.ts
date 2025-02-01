import { IsEnum, IsOptional, IsString } from 'class-validator';
import { IndividualRoleEnum } from '../../../individual/enums/individual.enum';

export class FilterJobsInput {
  @IsEnum(IndividualRoleEnum)
  jobCategory: IndividualRoleEnum;

  @IsString()
  @IsOptional()
  searchKey?: string;
}

export class JobIdInput {
  @IsString()
  jobId: string;
}
