import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsUrl,
  IsArray,
  IsPhoneNumber
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CompleteProfileDto {


  idCard?: any;

  @IsOptional()
  image?: any;

  @IsOptional()
  @IsString()
  major?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true) // ✅ Convert string "true"/"false" to boolean
  @IsBoolean()
  smoking?: boolean;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  socialPerson?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hobbies?: string[];

  @IsOptional()
  @IsUrl()
  facebook?: string;

  @IsOptional()
  @IsUrl()
  instagram?: string;

  @IsOptional()
  @IsUrl()
  linkedin?: string;


  @IsOptional()
  @IsString()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsString()
  university?: string;
}
