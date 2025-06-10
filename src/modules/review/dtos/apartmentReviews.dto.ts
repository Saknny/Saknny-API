import { IsInt, IsNotEmpty, IsOptional, IsString, Min, Max } from 'class-validator';

export class ApartmentReviewsDto {
    
  @IsNotEmpty()
  @IsString()
  apartmentId: string;
}