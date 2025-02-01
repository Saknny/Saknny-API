import { Expose } from 'class-transformer';
import {
  EyeColorEnum,
  HairColorEnum,
  IndividualGenderEnum,
  SkinToneEnum,
} from '../../../enums/individual.enum';
import { CountryEnum } from '../../../../../libs/enums/countries.enum';

export class ModelResponse {
  @Expose()
  birthDate: Date;

  @Expose()
  gender: IndividualGenderEnum;

  @Expose()
  nationality: CountryEnum;

  @Expose()
  skinToneEnum: SkinToneEnum;

  @Expose()
  hairColorEnum: HairColorEnum;

  @Expose()
  eyeColorEnum: EyeColorEnum;

  @Expose()
  weight: number;

  @Expose()
  height: number;

  @Expose()
  bust: number;

  @Expose()
  waist: number;

  @Expose()
  hips: number;

  @Expose()
  shoeSize?: number;

  @Expose()
  dressSize?: number;

  @Expose()
  profilePicture?: string;

  @Expose()
  headShots: string[];

  @Expose()
  portfolioPictures?: string[];

  @Expose()
  fullBodyShots: string[];
}
