import { IsOptional, IsString } from 'class-validator';

export class PhotographerSpecialtyInfoCompleteInput {
  @IsString()
  camera: string;

  @IsString()
  lightning: string;

  @IsString()
  lense: string;

  @IsOptional()
  @IsString({ each: true })
  profilePicture?: string[];

  @IsOptional()
  @IsString({ each: true })
  portfolioPictures?: string[];

  @IsOptional()
  @IsString({ each: true })
  reels?: string[];
}

export class PhotographerSpecialtyInfoUpdateInput {
  @IsOptional()
  @IsString()
  camera?: string;

  @IsOptional()
  @IsString()
  lightning?: string;

  @IsOptional()
  @IsString()
  lense?: string;

  @IsOptional()
  @IsString({ each: true })
  profilePicture?: string[];

  @IsOptional()
  @IsString({ each: true })
  portfolioPictures?: string[];

  @IsOptional()
  @IsString({ each: true })
  reels?: string[];
}
