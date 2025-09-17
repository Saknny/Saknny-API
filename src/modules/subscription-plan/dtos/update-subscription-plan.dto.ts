import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class UpdateSubscriptionPlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationInDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxApartments?: number;
}
