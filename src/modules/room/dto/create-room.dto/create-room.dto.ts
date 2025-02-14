import { IsArray, IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateBedDto } from '@src/modules/bed/dto/create-bed.dto/create-bed.dto';

export class CreateRoomDto {

  @IsNotEmpty()
  @IsString()
  descriptionEn: string;

  @IsNotEmpty()
  @IsString()
  descriptionAr: string;
  
  @IsNotEmpty()
  @IsNumber()
  bedCount: number;

  @IsOptional()
  @IsDateString()
  availableFor?: Date;

  @IsOptional()
  @IsBoolean()
  hasAirConditioner?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBedDto)
  beds: CreateBedDto[];
}
