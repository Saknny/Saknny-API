import { Expose } from 'class-transformer';

export class PhotographerResponse {
  @Expose()
  camera: string;

  @Expose()
  lightning: string;

  @Expose()
  lense: string;

  @Expose()
  profilePicture?: string[];

  @Expose()
  portfolioPictures?: string[];

  @Expose()
  reels?: string[];
}
