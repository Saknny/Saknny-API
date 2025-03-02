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

  @IsString()
  name:string;
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => CreateBedDto)
  // beds: CreateBedDto[];

  @IsBoolean()
  wardrobe: boolean;

  @IsBoolean()
  Desk: boolean;

  @IsBoolean()
  nightStand: boolean;


  @IsBoolean()
  ceilingFan: boolean;

  @IsBoolean()
  cutains: boolean;


  @IsBoolean()
  balacony: boolean;
}
