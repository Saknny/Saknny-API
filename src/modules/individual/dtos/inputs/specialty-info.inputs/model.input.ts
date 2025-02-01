import {
  IsDate,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  EyeColorEnum,
  HairColorEnum,
  IndividualGenderEnum,
  SkinToneEnum,
} from '../../../enums/individual.enum';
import { CountryEnum } from '../../../../../libs/enums/countries.enum';
import { Type } from 'class-transformer';

export class ModelSpecialtyInfoCompleteInput {
  @IsDate()
  @Type(() => Date)
  birthDate: Date;

  @IsEnum(IndividualGenderEnum)
  gender: IndividualGenderEnum;

  @IsEnum(CountryEnum)
  nationality: CountryEnum;

  @IsEnum(SkinToneEnum)
  skinToneEnum: SkinToneEnum;

  @IsEnum(HairColorEnum)
  hairColorEnum: HairColorEnum;

  @IsEnum(EyeColorEnum)
  eyeColorEnum: EyeColorEnum;

  @IsNumber()
  @Min(30)
  @Max(300)
  weight: number;

  @IsNumber()
  @Min(100)
  @Max(250)
  height: number;

  @IsNumber()
  @Min(50)
  @Max(150)
  waist?: number;

  @IsNumber()
  @Min(60)
  @Max(120)
  bust: number;

  @IsNumber()
  @Min(50)
  @Max(150)
  hips?: number;

  @IsNumber()
  @Min(20)
  @Max(50)
  shoeSize?: number;

  @IsNumber()
  @Min(0)
  @Max(20)
  dressSize?: number;

  @IsOptional()
  @IsString({ each: true })
  profilePicture?: string[];

  @IsOptional()
  @IsString({ each: true })
  portfolioPictures?: string[];

  @IsOptional()
  @IsOptional()
  headShots?: string[];

  @IsOptional()
  @IsString({ each: true })
  fullBodyShots?: string[];
}

export class ModelSpecialtyInfoUpdateInput {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  birthDate?: Date;

  @IsOptional()
  @IsEnum(IndividualGenderEnum)
  gender?: IndividualGenderEnum;

  @IsOptional()
  @IsEnum(CountryEnum)
  nationality?: CountryEnum;

  @IsOptional()
  @IsEnum(SkinToneEnum)
  skinToneEnum?: SkinToneEnum;

  @IsOptional()
  @IsEnum(HairColorEnum)
  hairColorEnum?: HairColorEnum;

  @IsOptional()
  @IsEnum(EyeColorEnum)
  eyeColorEnum?: EyeColorEnum;

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(300)
  weight?: number;

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(250)
  height?: number;

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(150)
  waist?: number;

  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(120)
  bust?: number;

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(150)
  hips?: number;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(50)
  shoeSize?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  dressSize?: number;

  @IsOptional()
  @IsString({ each: true })
  profilePicture?: string[];

  @IsOptional()
  @IsString({ each: true })
  portfolioPictures?: string[];

  @IsOptional()
  @IsOptional()
  headShots?: string[];

  @IsOptional()
  @IsString({ each: true })
  fullBodyShots?: string[];
}
