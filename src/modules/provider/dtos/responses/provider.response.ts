import { Expose } from 'class-transformer';

export class ProviderShortInfo {
  @Expose()
  name: string;

  @Expose()
  logo: string;
}

export class ProviderResponse extends ProviderShortInfo {
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

export class OrganizationWithExposeIdFullResponse extends ProviderResponse {
  @Expose()
  id: string;
}
