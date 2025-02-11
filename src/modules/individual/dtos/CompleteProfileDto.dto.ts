import {
    IsString,
    IsOptional,
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsUrl
  } from 'class-validator';
  import { Transform } from 'class-transformer';
  
  export class CompleteProfileDto {
    
    @IsOptional()
    idCardImage?: any;
  
    @IsOptional()
    profilePicture?: any;
  
    @IsOptional()
    @IsString()
    major?: string;
  
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true) // ✅ Convert string "true"/"false" to boolean
    @IsBoolean()
    smoking?: boolean;

    @IsOptional()
    @IsEnum([1, 2, 3, 4, 5, 6, 'master'])
    @Transform(({ value }) => (isNaN(value) ? value : Number(value))) // ✅ Convert number-like string to number
    level?: number | 'master';

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true) // ✅ Convert string "true"/"false" to boolean
    @IsBoolean()
    socialPerson?: boolean;
  
    @IsOptional()
    @IsString()
    hobbies?: string;

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
    phone?: string;

    @IsOptional()
    @IsString()
    university?: string;
  }
  