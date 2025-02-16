import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateBedDto {

    @IsOptional()
    @IsString()
    descriptionEn: string;

    @IsOptional()
    @IsString()
    descriptionAr: string;

    @IsOptional()
    @IsNumber()
    price: number;
}
