import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EntityType } from '../../request/entities/enum/entityType.enum';
import { CreateRoomDto } from '@src/modules/room/dto/create-room.dto/create-room.dto';
export class ImageDto {



    @IsString()
    @IsNotEmpty()
    imageUrl: string;

    @IsEnum(EntityType)
    entityType: EntityType;

    @IsString()
    entityId: string;

    @IsString()
    description: string;

}
