import { IsEnum, IsOptional, IsString } from 'class-validator';
import { IndividualRoleEnum } from '../../../individual/enums/individual.enum';

export class FilterIndividualsInput {
  @IsEnum(IndividualRoleEnum)
  individualCategory: IndividualRoleEnum;

  @IsString()
  @IsOptional()
  searchKey?: string;
}

export class IndividualIdInput {
  @IsString()
  individualId: string;
}
