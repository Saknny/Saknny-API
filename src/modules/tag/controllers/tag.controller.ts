import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { TagService } from '../services/tag.service';
import { JwtAuthenticationGuard } from '../../../libs/guards/strategy.guards/jwt.guard';
import { Auth } from '../../../libs/decorators/auth.decorator';
import { currentUser } from '../../../libs/decorators/currentUser.decorator';
import { Organization } from '../../organization/entities/organization.entity';
import { CreateTagInput } from '../dtos/inputs/create-tag.input';
import { Serialize } from '../../../libs/interceptors/serialize.interceptor';
import { FilterTagsInput } from '../dtos/inputs/filter-tag.input';
import { GetTagResponse } from '../dtos/responses/get-tag.response';

@Controller('tags')
@UseGuards(JwtAuthenticationGuard)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @Auth({ allow: 'organization' })
  @Serialize(GetTagResponse)
  async searchTag(@Query() { searchKey }: FilterTagsInput) {
    return await this.tagService.getTags(searchKey);
  }

  @Post()
  @Auth({ allow: 'organization' })
  @Serialize(GetTagResponse)
  async createTag(
    @currentUser('organization') organization: Organization,
    @Body() createTagDto: CreateTagInput,
  ) {
    return await this.tagService.createTag(organization, createTagDto);
  }
}
