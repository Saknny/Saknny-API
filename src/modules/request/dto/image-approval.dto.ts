
import { IsOptional, IsString, IsEnum } from "class-validator";
import { Status } from "@modules/request/entities/enum/status.enum"
export class ImageApprovalDto {

    @IsOptional()
    @IsString()
    reason: string;

    @IsEnum(Status)
    status: Status;


}