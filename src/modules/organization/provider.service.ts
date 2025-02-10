import { Injectable } from '@nestjs/common';
import { InjectBaseRepository } from '../../libs/decorators/inject-base-repository.decorator';
import { Provider } from './entities/provider.entity';
import { BaseRepository } from '../../libs/types/base-repository';

@Injectable()
export class ProviderService {
  constructor(
    @InjectBaseRepository(Provider)
    private readonly providerRepo: BaseRepository<Provider>,
  ) {}
}
