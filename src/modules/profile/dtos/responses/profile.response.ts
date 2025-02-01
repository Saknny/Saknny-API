import { Expose } from 'class-transformer';

export class ProfileResponse {
  @Expose()
  id: number;

  @Expose()
  bio: string;

  @Expose()
  website: string;

  @Expose()
  userId: number;

  constructor(profile: Partial<ProfileResponse>) {
    Object.assign(this, profile);
  }
}