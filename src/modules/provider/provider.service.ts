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
import { Bed } from '../bed/entities/bed.entity/bed.entity';
import { Room } from '../room/entities/room.entity/room.entity';
import { RentalRequest } from '../booking-request/entity/rental-request.entity';

@Injectable()
export class ProviderService {
  constructor(
    @InjectBaseRepository(Provider)
    private readonly providerRepository: BaseRepository<Provider>,
    @InjectRepository(Apartment)
    private readonly apartmentRepository: Repository<Apartment>,
     @InjectRepository(Bed)
    private readonly bedRepo:  BaseRepository<Bed>,
     @InjectRepository(Room)
    private readonly roomRepo:  BaseRepository<Room>,
     @InjectRepository(RentalRequest)
    private readonly rentalRequestRepo:  BaseRepository<RentalRequest>,
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
    const provider = await this.providerRepository.findOne(
      { id, status: Status.APPROVED },
      ['user'],
    );

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return provider;
  }

  async providerBoard(id: string) {
    const provider = await this.providerRepository.findOne({ id }, ['user']);

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return provider;
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
  // Step 1: Get the provider by userId
  const provider = await this.providerRepository
    .createQueryBuilder('provider')
    .where('provider.userId = :userId', { userId })
    .getOne();

  if (!provider) {
    throw new NotFoundException('Provider not found');
  }

  // Step 2: Get apartments with their rooms and beds
  const apartments = await this.apartmentRepository
    .createQueryBuilder('apartment')
    .leftJoinAndSelect('apartment.rooms', 'rooms')
    .leftJoinAndSelect('rooms.beds', 'beds')
    .where('apartment.providerId = :providerId', { providerId: provider.id })
    .getMany();

  return apartments;
}


  async updateCard(userId:string , idCard:string){
    const provider = await this.providerRepository.findOneBy({ userId });
    if (!provider) {
      throw new NotFoundException('provider not found');
    }
    provider.idCard =idCard;
    await this.providerRepository.save(provider);

  }
  async getProviderDashboardData(providerId: string) {
  // 1. Rented Apartments
  const rentedApartments = await this.apartmentRepository.count({
    where: {
      provider: { id: providerId },
      bookingStatus: 'BOOKED',
    },
  });

  // 2. Rented Beds
  const rentedBeds = await this.bedRepo
    .createQueryBuilder('bed')
    .leftJoin('bed.room', 'room')
    .leftJoin('room.apartment', 'apartment')
    .where('apartment.providerId = :providerId', { providerId })
    .andWhere('bed.status = :status', { status: 'RESERVED' })
    .getCount();

  // 3. Total Rooms
  const totalRooms = await this.roomRepo
    .createQueryBuilder('room')
    .leftJoin('room.apartment', 'apartment')
    .where('apartment.providerId = :providerId', { providerId })
    .getCount();

  // 4. Average Rating
  const avgRatingRaw = await this.apartmentRepository
    .createQueryBuilder('apartment')
    .select('AVG(apartment.averageRating)', 'avg')
    .where('apartment.providerId = :providerId', { providerId })
    .getRawOne();

  const averageRating = parseFloat(avgRatingRaw?.avg || 0).toFixed(1);

  // 5. Monthly Booking Requests
  const monthlyBookingRequests = await this.rentalRequestRepo
    .createQueryBuilder('rentalRequest')
    .leftJoin('rentalRequest.bed', 'bed')
    .leftJoin('bed.room', 'room')
    .leftJoin('room.apartment', 'apartment')
    .select(`TO_CHAR(rentalRequest.createdAt, 'Mon')`, 'month')
    .addSelect('COUNT(*)', 'count')
    .where('apartment.providerId = :providerId', { providerId })
    .groupBy('month')
    .orderBy('MIN(rentalRequest.createdAt)')
    .getRawMany();

  // 6. Rented Rooms Per Month
  const rentedRoomsPerMonth = await this.roomRepo
    .createQueryBuilder('room')
    .leftJoin('room.apartment', 'apartment')
    .leftJoin('room.beds', 'bed')
    .where('apartment.providerId = :providerId', { providerId })
    .andWhere('bed.status = :status', { status: 'RESERVED' })
    .select(`TO_CHAR(bed.createdAt, 'Mon')`, 'month')
    .addSelect('COUNT(DISTINCT room.id)', 'count')
    .groupBy('month')
    .orderBy('MIN(bed.createdAt)')
    .getRawMany();


   const topRatedApartments= await this.apartmentRepository
  .createQueryBuilder('apartment')
  .select(['apartment.title', 'apartment.averageRating'])
  .where('apartment.providerId = :providerId', { providerId })
  .orderBy('apartment.averageRating', 'DESC')
  .limit(5)
  .getMany();

  const requestStatusCounts = await this.rentalRequestRepo
    .createQueryBuilder('request')
    .leftJoin('request.bed', 'bed')
    .leftJoin('bed.room', 'room')
    .leftJoin('room.apartment', 'apartment')
    .where('apartment.providerId = :providerId', { providerId })
    .select('request.status', 'status')
    .addSelect('COUNT(*)', 'count')
    .groupBy('request.status')
    .getRawMany();

  const requestDistribution = {
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  for (const row of requestStatusCounts) {
    requestDistribution[row.status.toLowerCase()] = +row.count;
  }



  

  

  return {
    rentedApartments,
    rentedBeds,
    totalRooms,
    averageRating: Number(averageRating),
    monthlyBookingRequests,
    rentedRoomsPerMonth,
    topRatedApartments,
    requestDistribution
    
  };
}

}
