import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class EditorSpecialtyInfoCompleteInput {
  @IsString()
  editingSoftware: string;

  @IsBoolean()
  colorGrading: boolean;

  @IsBoolean()
  soundEditing: boolean;

  @IsBoolean()
  visualEffects: boolean;

  @IsBoolean()
  motionGraphics: boolean;

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

export class EditorSpecialtyInfoUpdateInput {
  @IsOptional()
  @IsString()
  editingSoftware?: string;

  @IsOptional()
  @IsBoolean()
  colorGrading?: boolean;

  @IsOptional()
  @IsBoolean()
  soundEditing?: boolean;

  @IsOptional()
  @IsBoolean()
  visualEffects?: boolean;

  @IsOptional()
  @IsBoolean()
  motionGraphics?: boolean;

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
