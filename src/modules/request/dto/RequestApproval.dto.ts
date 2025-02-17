import { IsOptional, IsString, IsEnum } from "class-validator";
import { Status } from "@modules/request/entities/enum/status.enum"

export class RequestApprovalDto {
    @IsOptional()
    @IsString()
    reason: string;

    @IsEnum(Status)
    status: Status;
}