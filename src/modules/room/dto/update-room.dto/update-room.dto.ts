import { IsBoolean, IsDateString, IsOptional, IsString } from "class-validator";

export class UpdateRoomDto {

    @IsOptional()
    @IsString()
    descriptionEn: string;

    @IsOptional()
    @IsString()
    descriptionAr: string;


    @IsOptional()
    @IsDateString()
    availableFor?: Date;

    @IsOptional()
    @IsBoolean()
    hasAirConditioner?: boolean;



}
