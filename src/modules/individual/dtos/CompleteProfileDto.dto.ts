import {
    IsString,
    IsOptional,
    IsBoolean,
    IsEnum,
    IsNotEmpty,
  } from 'class-validator';
 
  
  export class CompleteProfileDto {
    
    @IsOptional()
    idCardImage?: any;
  
    @IsOptional()
    profilePicture?: any;
  
    @IsOptional()
    @IsString()
    major?: string;
  
    @IsOptional()
    @IsBoolean()
    smoking?: boolean;
  
    @IsOptional()
    @IsEnum([1, 2, 3, 4, 5, 6, 'master'])
    level?: number | 'master';
  
    @IsOptional()
    @IsBoolean()
    socialPerson?: boolean;
  
    @IsOptional()
    @IsString()
    hobbies?: string;
  }
  