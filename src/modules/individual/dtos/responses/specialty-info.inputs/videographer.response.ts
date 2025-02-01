import { Expose } from 'class-transformer';

export class VideographerResponse {
  @Expose()
  camera: string;

  @Expose()
  lightning: string;

  @Expose()
  lense: string;

  @Expose()
  stabilizer: boolean;

  @Expose()
  profilePicture?: string[];

  @Expose()
  portfolioPictures?: string[];

  @Expose()
  reels?: string[];
}
