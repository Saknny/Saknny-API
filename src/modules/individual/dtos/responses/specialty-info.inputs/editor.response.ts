import { Expose } from 'class-transformer';

export class EditorResponse {
  @Expose()
  editingSoftware: string;

  @Expose()
  colorGrading: boolean;

  @Expose()
  soundEditing: boolean;

  @Expose()
  visualEffects: boolean;

  @Expose()
  motionGraphics: boolean;

  @Expose()
  profilePicture?: string[];

  @Expose()
  portfolioPictures?: string[];

  @Expose()
  reels?: string[];
}
