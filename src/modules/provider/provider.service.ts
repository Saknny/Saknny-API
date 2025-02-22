import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { CompleteProviderProfileInput } from './dtos/inputs/complete-profile.input';
import { Apartment } from '../apartment/entities/apartment.entity/apartment.entity';
import { InjectBaseRepository } from '@src/libs/decorators/inject-base-repository.decorator';
import { BaseRepository } from '@src/libs/types/base-repository';
import { ErrorCodeEnum } from '@src/libs/application/exceptions/error-code.enum';
import { Status } from '../request/entities/enum/status.enum';

@Injectable()
export class ProviderService {
  constructor(
    @InjectBaseRepository(Provider)
    private readonly providerRepository: BaseRepository<Provider>,
    @InjectRepository(Apartment)
    private readonly apartmentRepository: Repository<Apartment>,
  ) {}

  async getById(id: string) {
    const provider = await this.providerRepository.findOneBy({ id });

    if (!provider) {
      throw new NotFoundException('provider not found');
    }
    await this.providerRepository.save(provider);

    return provider;
  }

  async provider(id: string) {
    return this.providerRepository.findOneOrError(
      { id, status: Status.APPROVED },
      ErrorCodeEnum.PROVIDER_NOT_FOUND_OR_NOT_PENDING_NOR_REJECTED,
      ['user'],
    );
  }

  async updateProfile(userId: string, attrs: Partial<Provider>) {
    const provider = await this.providerRepository.findOneBy({ userId });
    if (!provider) {
      throw new NotFoundException('provider not found');
    }
    provider.status = Status.APPROVED;
    if (attrs.facebook) {
      provider.facebook = attrs.facebook;
    }
    if (attrs.instagram) {
      provider.instagram = attrs.instagram;
    }
    if (attrs.linkedin) {
      provider.linkedin = attrs.linkedin;
    }
    if (attrs.idCard) {
      provider.idCard = attrs.idCard;
    }
    if (attrs.image) {
      provider.image = attrs.image;
    }
    if (attrs.gender) {
      provider.gender = attrs.gender;
    }
    if (attrs.firstName) {
      provider.firstName = attrs.firstName;
    }
    if (attrs.lastName) {
      provider.lastName = attrs.lastName;
    }
    if (attrs.phone) {
      provider.phone = attrs.phone;
    }

    return this.providerRepository.save(provider);
  }

  //provider list all his apartments
  async getProviderApartments(userId: string): Promise<Apartment[]> {
    const provider = await this.providerRepository
      .createQueryBuilder('provider')
      .leftJoinAndSelect('provider.apartments', 'apartments')
      .leftJoinAndSelect('apartments.rooms', 'rooms')
      .where('provider.userId = :userId', { userId })
      .getOne();

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return provider.apartments || [];
  }
}
