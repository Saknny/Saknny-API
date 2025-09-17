import { ApartmentLocation } from '../enums/location.enum';
import { IsOptional, IsEnum, IsString, IsNumber, Min, IsInt, Max, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchApartmentsDto {
  @IsOptional()
  @IsEnum(ApartmentLocation)
  locationEnum?: ApartmentLocation;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @Transform(({ value }) => value !== undefined ? parseFloat(value) : undefined)
  @IsNumber({}, { message: 'minPrice must be a number' })
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Transform(({ value }) => value !== undefined ? parseFloat(value) : undefined)
  @IsNumber({}, { message: 'maxPrice must be a number' })
  @Min(0)
  maxPrice?: number;

  // Pagination
  @IsOptional()
  @Transform(({ value }) => value !== undefined ? parseFloat(value) : undefined)
  @IsInt()
  @Min(1)
  page: number = 1; // Default to page 1

  @IsOptional()
  @Transform(({ value }) => value !== undefined ? parseFloat(value) : undefined)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10; // Default to 10 items per page

  // Sorting
  @IsOptional()
  @IsString()
  sortBy: string = 'createdAt'; // Default sort field

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'DESC'; // Default sort order

  @IsOptional()
  @IsString()
  filterByGender?: string;
@IsOptional()
@Transform(({ value }) => value === 'true' || value === true)
@IsBoolean({ message: 'matching must be a boolean value (true or false)' })
matching?: boolean;

}
