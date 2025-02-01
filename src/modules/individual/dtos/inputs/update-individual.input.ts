import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { WorkExperience } from '../../entities/individual.entity';
import { IndividualRoleEnum } from '../../enums/individual.enum';
import { ModelSpecialtyInfoUpdateInput } from './specialty-info.inputs/model.input';
import { EditorSpecialtyInfoUpdateInput } from './specialty-info.inputs/editor.input';
import { VideographerSpecialtyInfoUpdateInput } from './specialty-info.inputs/videographer.input';
import { PhotographerSpecialtyInfoUpdateInput } from './specialty-info.inputs/photographer.input';
import { UpdateUserInfo } from '../../../user/dtos/inputs/update-user.input';

export type SpecialtyInfoUpdateType =
  | ModelSpecialtyInfoUpdateInput
  | EditorSpecialtyInfoUpdateInput
  | VideographerSpecialtyInfoUpdateInput
  | PhotographerSpecialtyInfoUpdateInput;

export class UpdateIndividualInput {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserInfo)
  accountInfo: UpdateUserInfo;

  @IsEnum(IndividualRoleEnum)
  role: IndividualRoleEnum;

  @IsOptional()
  @IsBoolean()
  isVisible: boolean;

  @IsOptional()
  @IsString()
  bio: string;

  @IsOptional()
  @IsUrl()
  socialAccount: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  yearsOfExperience: number;

  @IsOptional()
  @ValidateIf((o) => o.yearsOfExperience > 0)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkExperience)
  workExperience?: WorkExperience[];

  @IsOptional()
  @IsBoolean()
  availableForTravel: boolean;

  @IsOptional()
  @IsBoolean()
  legallyWorking: boolean;

  @IsOptional()
  @IsBoolean()
  holdingBachelors: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(({ object }) => {
    switch (object.role) {
      case IndividualRoleEnum.MODEL:
        return ModelSpecialtyInfoUpdateInput;
      case IndividualRoleEnum.EDITOR:
        return EditorSpecialtyInfoUpdateInput;
      case IndividualRoleEnum.VIDEOGRAPHER:
        return VideographerSpecialtyInfoUpdateInput;
      case IndividualRoleEnum.PHOTOGRAPHER:
        return PhotographerSpecialtyInfoUpdateInput;
    }
  })
  specialtyInfo: SpecialtyInfoUpdateType;
}
