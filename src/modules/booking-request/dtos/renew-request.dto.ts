import { IsNumber, IsString, Min } from 'class-validator';

export class RenewRequestDto {
  @IsString()
  requestId: string;

  @IsNumber()
  @Min(1, { message: 'Renewal duration must be at least 1 month' })
  duration: number;
}
