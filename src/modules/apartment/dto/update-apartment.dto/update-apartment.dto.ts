import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

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


     @IsBoolean()
     tv: boolean;

     @IsBoolean()
     refrigerator: boolean;

     @IsBoolean()
     stove: boolean;


     @IsBoolean()
     microwave: boolean;

     @IsBoolean()
     kettle: boolean;

     @IsBoolean()
     washingMachine: boolean;

     @IsBoolean()
     waterHeater: boolean;

     @IsBoolean()
     standFan: boolean;

     @IsBoolean()
     Iron: boolean;

     @IsBoolean()
     wifi: boolean;

     @IsNumber()
     size: number;

     @IsNumber()
     floor: number;

     @IsBoolean()
     elavator: boolean;

     @IsBoolean()
     furnished: boolean;

     @IsNumber()
     bathrooms: number;
}
