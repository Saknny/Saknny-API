import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { CompleteProviderProfileInput } from './dtos/inputs/complete-profile.input';

@Injectable()
export class ProviderService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) { }



  async updateProfile(userId: string, attrs: Partial<Provider>) {
    const provider = await this.providerRepository.findOneBy({ userId });
    if (!provider) {
      throw new NotFoundException('provider not found');
    }
    Object.assign(provider, attrs);
    return this.providerRepository.save(provider);
  }
}