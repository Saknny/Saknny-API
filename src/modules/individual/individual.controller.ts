import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IndividualService } from './individual.service';
import { PaginatorInput } from '../../libs/application/paginator/paginator.input';
import { PaginatorResponse } from '../../libs/application/paginator/paginator.response';
import { IndividualWithIdResponse } from './dtos/responses/individual.response';
import { Auth } from '../../libs/decorators/auth.decorator';
import { Serialize } from '../../libs/interceptors/serialize.interceptor';
import {
  FilterIndividualsInput,
  IndividualIdInput,
} from './dtos/inputs/filter-individual.input';
import { JwtAuthenticationGuard } from '../../libs/guards/strategy.guards/jwt.guard';
import { currentUser } from '../../libs/decorators/currentUser.decorator';
import { User } from '../user/entities/user.entity';
import { UpdateIndividualInput } from './dtos/inputs/update-individual.input';

@Controller('individuals')
@UseGuards(JwtAuthenticationGuard)
export class IndividualController {
  constructor(private readonly individualService: IndividualService) {}

  @Get()
  @Auth({ allow: 'organization' })
  @Serialize(PaginatorResponse, IndividualWithIdResponse)
  async geIndividuals(
    @Query('filter') jobIndividualInput: FilterIndividualsInput,
    @Query('paginate') paginate: PaginatorInput,
  ) {
    if (!paginate) paginate = { page: 1, limit: 15 };
    return await this.individualService.searchIndividuals(
      jobIndividualInput,
      paginate,
    );
  }

  @Get('/:individualId')
  @Auth({ allow: 'organization' })
  @Serialize(IndividualWithIdResponse)
  async getIndividual(@Param() { individualId }: IndividualIdInput) {
    return await this.individualService.getIndividual(individualId);
  }

  @Patch('/me')
  @Auth({ allow: 'individual' })
  @Serialize(IndividualWithIdResponse)
  async updateIndividual(
    @currentUser() user: User,
    @Body() body: UpdateIndividualInput,
  ) {
    return await this.individualService.updateIndividual(user, body);
  }
}
