import {  IsOptional, IsString } from "class-validator";

export class UpdateApartmentDto {
     @IsOptional()
     @IsString()
     descriptionEn: string;
   
     @IsOptional()
     @IsString()
     descriptionAr: string;
   
     @IsOptional()
     @IsString()
     gender: string; 
}
