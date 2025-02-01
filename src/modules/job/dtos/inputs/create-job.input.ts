import { IsEnum, IsNumber, IsString, ValidateNested } from 'class-validator';
import { IndividualRoleEnum } from '../../../individual/enums/individual.enum';
import { CareerLevelEnum, EducationLevelEnum } from '../../enums/job.enum';
import { JobDuration, JobRequiredExperience } from '../../entities/job.entity';
import { Type } from 'class-transformer';

export class CreateJobInput {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  requirements: string;

  // ADD
  @IsString()
  location: string;

  // ADD
  @IsNumber()
  salary: number;

  // ADD
  @ValidateNested()
  @Type(() => JobRequiredExperience)
  requiredExperience: JobRequiredExperience;

  // ADD
  @ValidateNested()
  @Type(() => JobDuration)
  jobDuration: JobDuration;

  // ADD
  @IsEnum(EducationLevelEnum)
  educationLevel: EducationLevelEnum;

  @IsEnum(CareerLevelEnum)
  careerLevel: CareerLevelEnum;

  @IsEnum(IndividualRoleEnum)
  jobCategory: IndividualRoleEnum;

  @IsString({ each: true })
  tags: string[];
}
