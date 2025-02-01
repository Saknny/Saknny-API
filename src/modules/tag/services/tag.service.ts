import { Injectable } from '@nestjs/common';
import { InjectBaseRepository } from '../../../libs/decorators/inject-base-repository.decorator';
import { BaseRepository } from '../../../libs/types/base-repository';
import { Organization } from '../../organization/entities/organization.entity';
import { Tag } from '../entities/tag.entity';
import { CreateTagInput } from '../dtos/inputs/create-tag.input';
import { ILike } from 'typeorm';

@Injectable()
export class TagService {
  constructor(
    @InjectBaseRepository(Tag)
    private readonly tagRepo: BaseRepository<Tag>,
  ) {}

  async getTags(searchKey: string) {
    return this.tagRepo.findAll({
      ...(searchKey && { title: ILike(`%${searchKey}%`) }),
      isApproved: true,
    });
  }

  async createTag(organization: Organization, createTagDto: CreateTagInput) {
    return await this.tagRepo.createOne({
      ...createTagDto,
      isApproved: true,
    });
  }
}
