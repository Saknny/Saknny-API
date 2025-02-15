import { IsBoolean, IsOptional, IsString, IsEnum, isPhoneNumber, IsPhoneNumber, IsArray, } from 'class-validator';
import { Transform } from 'class-transformer';
export class UpdateStudentInput {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  facebook?: string;

  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  idCardImage?: any;

  @IsOptional()
  @IsString()
  profilePictureUrl?: string;

  @IsOptional()
  @IsString()
  major?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  smoking?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  socialPerson?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hobbies: string[];


  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsString()
  university?: string;
}
