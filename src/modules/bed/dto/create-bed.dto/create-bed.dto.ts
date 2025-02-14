import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBedDto {
  @IsNotEmpty()
  @IsString()
  descriptionEn: string;

  @IsNotEmpty()
  @IsString()
  descriptionAr: string;

  @IsNotEmpty()
  @IsString()
  image: string;

  @IsNumber()
  price: number;
}
