import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateApartmentDto {
     @IsString()
     title: string

     @IsOptional()
     @IsString()
     descriptionEn: string;

     @IsOptional()
     @IsString()
     descriptionAr: string;

     @IsOptional()
     @IsString()
     gender: string;


     @IsOptional()
     @IsBoolean()
     tv: boolean;

     @IsOptional()
     @IsBoolean()
     refrigerator: boolean;

     @IsOptional()
     @IsBoolean()
     stove: boolean;

     @IsOptional()
     @IsBoolean()
     microwave: boolean;

     @IsOptional()
     @IsBoolean()
     kettle: boolean;

     @IsOptional()
     @IsBoolean()
     washingMachine: boolean;

     @IsOptional()
     @IsBoolean()
     waterHeater: boolean;

     @IsOptional()
     @IsBoolean()
     standFan: boolean;

     @IsOptional()
     @IsBoolean()
     Iron: boolean;

     @IsOptional()
     @IsBoolean()
     wifi: boolean;

     @IsOptional()
     @IsNumber()
     size: number;

     @IsOptional()
     @IsNumber()
     floor: number;

     @IsOptional()
     @IsBoolean()
     elavator: boolean;

     @IsOptional()
     @IsBoolean()
     furnished: boolean;

     @IsOptional()
     @IsNumber()
     bathrooms: number;
}
