import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  IsUrl,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { IndividualRoleEnum } from '../../enums/individual.enum';
import { WorkExperience } from '../../entities/individual.entity';
import { Type } from 'class-transformer';
import { ModelSpecialtyInfoCompleteInput } from './specialty-info.inputs/model.input';
import { EditorSpecialtyInfoCompleteInput } from './specialty-info.inputs/editor.input';
import { VideographerSpecialtyInfoCompleteInput } from './specialty-info.inputs/videographer.input';
import { PhotographerSpecialtyInfoCompleteInput } from './specialty-info.inputs/photographer.input';

export type SpecialtyInfoType =
  | ModelSpecialtyInfoCompleteInput
  | EditorSpecialtyInfoCompleteInput
  | VideographerSpecialtyInfoCompleteInput
  | PhotographerSpecialtyInfoCompleteInput;

export class CompleteIndividualProfileInput {
  @IsEnum(IndividualRoleEnum)
  role: IndividualRoleEnum;

  @IsString()
  bio: string;

  @IsUrl()
  socialAccount: string;

  @IsNumber()
  @Min(0)
  yearsOfExperience: number;

  @ValidateIf((o) => o.yearsOfExperience > 0)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkExperience)
  workExperience?: WorkExperience[];

  @IsBoolean()
  availableForTravel: boolean;

  @IsBoolean()
  legallyWorking: boolean;

  @IsBoolean()
  holdingBachelors: boolean;

  @ValidateNested()
  @Type(({ object }) => {
    switch (object.role) {
      case IndividualRoleEnum.MODEL:
        return ModelSpecialtyInfoCompleteInput;
      case IndividualRoleEnum.EDITOR:
        return EditorSpecialtyInfoCompleteInput;
      case IndividualRoleEnum.VIDEOGRAPHER:
        return VideographerSpecialtyInfoCompleteInput;
      case IndividualRoleEnum.PHOTOGRAPHER:
        return PhotographerSpecialtyInfoCompleteInput;
    }
  })
  specialtyInfo: SpecialtyInfoType;
}
