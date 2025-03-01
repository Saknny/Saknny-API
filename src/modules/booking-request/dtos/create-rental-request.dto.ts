import { IsNumber, IsPositive, IsString, Min } from 'class-validator';

export class CreateRentalRequestDto {
  @IsString()
  roomId: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @Min(1, { message: 'Duration must be at least 1 month' })
  duration: number;
}
