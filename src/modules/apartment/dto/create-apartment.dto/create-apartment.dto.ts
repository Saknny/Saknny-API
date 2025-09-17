import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRoomDto } from '@src/modules/room/dto/create-room.dto/create-room.dto';
import { ApartmentLocation } from '../../enums/location.enum';
export class CreateApartmentDto {
  @IsNotEmpty()
  @IsString()
  descriptionEn: string;

  @IsNotEmpty()
  @IsString()
  descriptionAr: string;


  @IsNumber()
  roomCount: number;

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
  iron: boolean;

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

  @IsString()
  title:string

  
  @IsEnum(ApartmentLocation)
  locationEnum: ApartmentLocation;

}
