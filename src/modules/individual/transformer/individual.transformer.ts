import { Injectable } from '@nestjs/common';
import { Model } from '../entities/specialties/model.entity';
import { Editor } from '../entities/specialties/editor.entity';
import { Videographer } from '../entities/specialties/videographer.entity';
import { Photographer } from '../entities/specialties/photographer.entity';
import { InjectBaseRepository } from '../../../libs/decorators/inject-base-repository.decorator';
import { BaseRepository } from '../../../libs/types/base-repository';
import { Individual } from '../entities/individual.entity';
import { SpecialtyInfoType } from '../dtos/inputs/individual.input';
import { IndividualRoleEnum } from '../enums/individual.enum';
import { SpecialtyInfoUpdateType } from '../dtos/inputs/update-individual.input';

@Injectable()
export class IndividualTransformer {
  constructor(
    @InjectBaseRepository(Model)
    private readonly modelRepo: BaseRepository<Model>,
    @InjectBaseRepository(Editor)
    private readonly editorRepo: BaseRepository<Editor>,
    @InjectBaseRepository(Videographer)
    private readonly videographerRepo: BaseRepository<Videographer>,
    @InjectBaseRepository(Photographer)
    private readonly photographerRepo: BaseRepository<Photographer>,
  ) {}

  async createIndividualSpecialty(
    individual: Individual,
    specialtyInfo: SpecialtyInfoType,
  ) {
    const { role } = individual;

    const repositoryMap = {
      [IndividualRoleEnum.EDITOR]: this.editorRepo,
      [IndividualRoleEnum.MODEL]: this.modelRepo,
      [IndividualRoleEnum.PHOTOGRAPHER]: this.photographerRepo,
      [IndividualRoleEnum.VIDEOGRAPHER]: this.videographerRepo,
    };

    const repository = repositoryMap[role];
    await repository.createOne({ ...specialtyInfo, individual });
  }

  async updateIndividualSpecialty(
    individual: Individual,
    specialtyInfo: SpecialtyInfoUpdateType,
  ) {
    const { role } = individual;

    const repositoryMap = {
      [IndividualRoleEnum.EDITOR]: this.editorRepo,
      [IndividualRoleEnum.MODEL]: this.modelRepo,
      [IndividualRoleEnum.PHOTOGRAPHER]: this.photographerRepo,
      [IndividualRoleEnum.VIDEOGRAPHER]: this.videographerRepo,
    };

    const repository = repositoryMap[role];
    await repository.update(
      { individualId: individual.id },
      { ...specialtyInfo },
    );
  }
}
