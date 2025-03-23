import { IsString, IsNotEmpty } from 'class-validator';

export class RemoveApartmentDto {
  @IsNotEmpty()
  @IsString()
  apartmentId: string;
}