import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBedDto {
  @IsNotEmpty()
  @IsString()
  descriptionEn: string;

  @IsNotEmpty()
  @IsString()
  descriptionAr: string;


  @IsNumber()
  price: number;
}
