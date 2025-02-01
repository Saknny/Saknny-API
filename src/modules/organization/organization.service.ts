import { Injectable } from '@nestjs/common';
import { InjectBaseRepository } from '../../libs/decorators/inject-base-repository.decorator';
import { Organization } from './entities/organization.entity';
import { BaseRepository } from '../../libs/types/base-repository';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectBaseRepository(Organization)
    private readonly organizationRepo: BaseRepository<Organization>,
  ) {}
}
