import { IsInt, IsNotEmpty, IsOptional, IsString, Min, Max, IsBoolean } from 'class-validator';

export class AddReportDto {

  @IsOptional()
  @IsString()
  comment?: string;

  @IsNotEmpty()
  @IsString()
  apartmentId: string;



}