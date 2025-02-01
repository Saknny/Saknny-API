import { Expose } from 'class-transformer';

export class OrganizationShortInfo {
  @Expose()
  name: string;

  @Expose()
  logo: string;
}

export class OrganizationResponse extends OrganizationShortInfo {
  @Expose()
  bio: string;

  @Expose()
  location: string;

  @Expose()
  instagram: string;

  @Expose()
  tiktok: string;

  @Expose()
  website: string;

  @Expose()
  phone: string;
}

export class OrganizationWithExposeIdFullResponse extends OrganizationResponse {
  @Expose()
  id: string;
}
