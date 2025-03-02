import { IsOptional, IsString, IsEnum } from "class-validator";
import { Status } from "@modules/request/entities/enum/status.enum"
import { Type } from "../entities/enum/type.enum";

export class RequestDto {

    @IsString()
    id: string;

    @IsOptional()
    @IsString()
    reason: string;

    @IsOptional()
    @IsEnum(Status)
    status: Status;


    @IsOptional()
    @IsEnum(Type)
    type: Type;
}