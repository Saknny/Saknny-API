import { IsEnum, IsPhoneNumber, IsString, IsUrl } from 'class-validator';
import { CountryEnum } from '../../../../libs/enums/countries.enum';

export class CompleteProviderProfileInput {
  @IsString()
  bio: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  logo?: string;

  @IsEnum(CountryEnum)
  location: CountryEnum;

  @IsUrl(
    { host_whitelist: ['www.instagram.com'] },
    { message: 'Invalid Instagram URL' },
  )
  instagram: string;

  @IsUrl(
    { host_whitelist: ['www.tiktok.com'] },
    { message: 'Invalid TikTok URL' },
  )
  tiktok: string;

  @IsUrl()
  website: string;

  @IsPhoneNumber(null)
  phone: string;
}
