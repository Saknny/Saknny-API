import { IsOptional, IsString, IsEnum } from "class-validator";
import { Status } from "@modules/request/entities/enum/status.enum"

export class ItemDto {

    @IsString()
    id: string;

    @IsOptional()
    @IsString()
    reason: string;

    @IsOptional()
    @IsEnum(Status)
    status: Status;
}