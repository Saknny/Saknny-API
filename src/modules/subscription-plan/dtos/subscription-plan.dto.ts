import { IsString, IsNumber, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateSubscriptionPlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  durationInDays: number;

  @IsNumber()
  @Min(1)
  @Max(1000)
  maxApartments: number;
}
