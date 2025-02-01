import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class VideographerSpecialtyInfoCompleteInput {
  @IsString()
  camera: string;

  @IsString()
  lightning: string;

  @IsString()
  lense: string;

  @IsBoolean()
  stabilizer: boolean;

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

export class VideographerSpecialtyInfoUpdateInput {
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
  @IsBoolean()
  stabilizer?: boolean;

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
