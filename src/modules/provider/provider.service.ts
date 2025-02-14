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

  async getById(id: string) {
    const provider = await this.providerRepository.findOneBy({ id });
    if (!provider) {
      throw new NotFoundException('provider not found');
    }
    return provider
  }

  async updateProfile(userId: string, attrs: Partial<Provider>) {
    const provider = await this.providerRepository.findOneBy({ userId });
    if (!provider) {
      throw new NotFoundException('provider not found');
    }
    Object.assign(provider, attrs);
    if (attrs.idCard != null) {
      provider.isReviewed = false;
      provider.isTrusted = false;
      return this.providerRepository.save(provider);
    }
  }


    async updateProviderApproval(id: string, isTrusted: boolean): Promise<Provider> {
      const provider = await this.providerRepository.findOneBy({ id });
      if (!provider) {
        throw new NotFoundException(`Provider not found`);
      }
      provider.isTrusted = isTrusted;
      return this.providerRepository.save(provider);
    }
  
    async getUnReviewedProviders(): Promise<Provider[]> {
      return this.providerRepository.find({
        where: {
          isReviewed: false
        },
      });
    }
}

  