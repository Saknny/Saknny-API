import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider, SocialLinks } from './entities/provider.entity';
import { CompleteProviderProfileInput } from './dtos/inputs/complete-profile.input';

@Injectable()
export class ProviderService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) { }

  async completeProfile(userId: string, profileData: CompleteProviderProfileInput, idCard: string, image: string): Promise<Provider> {

    const provider = await this.providerRepository.findOneBy({ userId });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    provider.phone = profileData.phone;
    provider.facebook = profileData.facebook;
    provider.instagram = profileData.instagram
    provider.linkedin = profileData.linkedin
    
    if (image) {
      provider.image = image;
    }
    if (idCard) {
      provider.idCard = idCard;
    }
    return this.providerRepository.save(provider);
  }
}