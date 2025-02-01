import { IsString, IsOptional } from 'class-validator';

export class CreateProfileInput {
  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  website?: string;
}