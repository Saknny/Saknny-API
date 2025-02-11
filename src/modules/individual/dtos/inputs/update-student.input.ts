import { IsBoolean, IsOptional, IsString,IsEnum, } from 'class-validator';
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
  facebook?: string;

  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsEnum([1, 2, 3, 4, 5, 6, 'master'])
  @Transform(({ value }) => (isNaN(value) ? value : Number(value))) // ✅ Convert number-like string to number
  level?: number | 'master';

  @IsOptional()
  @IsString()
  idCardImageUrl?: string;

  @IsOptional()
  @IsString()
  profilePictureUrl?: string;

  @IsOptional()
  @IsString()
  major?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true) // ✅ Convert string "true"/"false" to boolean
  @IsBoolean()
  smoking?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true) // ✅ Convert string "true"/"false" to boolean
  @IsBoolean()
  socialPerson?: boolean;

  @IsOptional()
  @IsString()
  hobbies?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  university?: string;
}
