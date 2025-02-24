import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRoomDto } from '@src/modules/room/dto/create-room.dto/create-room.dto';
export class CreateApartmentDto {
  @IsNotEmpty()
  @IsString()
  descriptionEn: string;

  @IsNotEmpty()
  @IsString()
  descriptionAr: string;

  @IsString()
  name: string;

  @IsNumber()
  roomCount: Number;

  @IsOptional()
  @IsString()
  gender: string;
}
