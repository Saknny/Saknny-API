import { IsOptional, IsString } from 'class-validator';

export class FilterTagsInput {
  @IsOptional()
  @IsString()
  searchKey: string;
}
