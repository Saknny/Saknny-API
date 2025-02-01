import { IsString, IsOptional } from 'class-validator';

export class UpdateProfileInput {
  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  website?: string;
}