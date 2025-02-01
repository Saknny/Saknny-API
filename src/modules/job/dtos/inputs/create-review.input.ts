import { IsNumber, IsString, Min, Max } from 'class-validator';

export class CreateReviewInput {
  @IsNumber()
  @Min(1)
  @Max(5) 
  rating: number;

  @IsString()
  comment: string;
}