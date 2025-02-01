import { Transform, Type } from 'class-transformer';
import {
  Min,
  IsOptional,
  ValidateNested,
  IsString,
  IsNumber,
  IsIn,
} from 'class-validator';

export class CursorBasedPaginatorInput {
  @IsString()
  @IsOptional()
  cursor?: string;

  @IsString()
  @IsOptional()
  @IsIn(['AFTER', 'BEFORE'])
  direction?: 'AFTER' | 'BEFORE' = 'AFTER';

  @Min(1)
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

export class NullableCursorBasedPaginatorInput {
  @IsOptional()
  @ValidateNested()
  paginate?: CursorBasedPaginatorInput;
}

export class PaginatorInput {
  @Min(1)
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @Min(1)
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

export class CursorPaginatorInput {
  @IsString()
  @IsOptional()
  cursor: string;

  @Min(1)
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit: number;

  @IsOptional()
  @IsIn(['AFTER', 'BEFORE'])
  direction: 'AFTER' | 'BEFORE';
}
