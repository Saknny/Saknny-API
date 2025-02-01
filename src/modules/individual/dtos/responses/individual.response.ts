import { Expose, plainToInstance, Transform } from 'class-transformer';
import { IndividualRoleEnum } from '../../enums/individual.enum';
import { WorkExperience } from '../../entities/individual.entity';
import { ModelResponse } from './specialty-info.inputs/model.response';
import { PhotographerResponse } from './specialty-info.inputs/photographer.response';
import { VideographerResponse } from './specialty-info.inputs/videographer.response';
import { EditorResponse } from './specialty-info.inputs/editor.response';

export class IndividualResponse {
  @Expose()
  isVisible: boolean;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  fullName: string;

  @Expose()
  role: IndividualRoleEnum;

  @Expose()
  bio: string;

  @Expose()
  socialAccount: string;

  @Expose()
  workExperience: WorkExperience;

  @Expose()
  availableForTravel: boolean;

  @Expose()
  legallyWorking: boolean;

  @Expose()
  holdingBachelors: boolean;

  @Expose()
  @Transform(({ obj }) => {
    const responseMapping = {
      [IndividualRoleEnum.MODEL]: ModelResponse,
      [IndividualRoleEnum.EDITOR]: EditorResponse,
      [IndividualRoleEnum.PHOTOGRAPHER]: PhotographerResponse,
      [IndividualRoleEnum.VIDEOGRAPHER]: VideographerResponse,
    };

    return responseMapping[obj.role]
      ? plainToInstance(responseMapping[obj.role], obj?.specialtyInfo, {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        })
      : null;
  })
  specialtyInfo:
    | ModelResponse
    | EditorResponse
    | PhotographerResponse
    | VideographerResponse;
}

export class IndividualWithIdResponse extends IndividualResponse {
  @Expose()
  id: string;
}

export class IndividualShortInfo {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  fullName: string;

  @Expose()
  role: IndividualRoleEnum;
}
