import { IsInt, IsNotEmpty, IsOptional, IsString, Min, Max, IsBoolean } from 'class-validator';

export class AddReviewDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsNotEmpty()
  @IsString()
  apartmentId: string;





}