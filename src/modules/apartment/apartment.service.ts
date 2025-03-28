import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Apartment } from './entities/apartment.entity/apartment.entity';
import { Provider } from '../provider/entities/provider.entity';
import { CreateApartmentDto } from './dto/create-apartment.dto/create-apartment.dto';
import { Room } from '../room/entities/room.entity/room.entity';
import { Bed } from '../bed/entities/bed.entity/bed.entity';
import { BaseRepository } from '@src/libs/types/base-repository';
import { currentUser } from '../../libs/decorators/currentUser.decorator';
import { Not, Repository, IsNull, FindManyOptions } from 'typeorm';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { UpdateApartmentDto } from './dto/update-apartment.dto/update-apartment.dto';
import { ApartmentDocument } from './entities/document.entity';
import { ErrorCodeEnum } from '@src/libs/application/exceptions/error-code.enum';
import { GetApartmentsDto } from './dto/get-apartments.dto';
import { Status } from '../request/entities/enum/status.enum';
import { ProviderSubscriptionService } from '../provider-subscription/provider-subscription.service';
import { Student } from '../student/entities/student.entity';
import { ApartmentLocation } from './enums/location.enum';
import { FavoriteApartment } from '../favoriteList/entities/favorite-apartment.entity';

@Injectable()
export class ApartmentService {
  constructor(
    @InjectRepository(Apartment)
    private readonly apartmentRepository: BaseRepository<Apartment>,

    @InjectRepository(Provider)
    private readonly providerRepository: BaseRepository<Provider>,

    @InjectRepository(Room)
    private readonly roomRepository: BaseRepository<Room>,

    @InjectRepository(Bed)
    private readonly bedRepository: BaseRepository<Bed>,
    @InjectRepository(Student)
    private readonly studentRepository: BaseRepository<Student>,

    @InjectRepository(FavoriteApartment)
    private readonly favoriteApartmentRepository: BaseRepository<FavoriteApartment>,

    @InjectRepository(ApartmentDocument)
    private readonly apartmentDocumentRepo: BaseRepository<ApartmentDocument>,
    @Inject(ProviderSubscriptionService)
    private readonly providerSubscriptionService: ProviderSubscriptionService,
  ) {}

  async createApartment(
    userId: string,
    createApartmentDto: CreateApartmentDto,
  ): Promise<Apartment> {
    const provider = await this.providerRepository.findOne({ userId });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const apartment = this.apartmentRepository.create({
      ...createApartmentDto,
      provider,
    });

    await this.apartmentRepository.save(apartment);

    return apartment;
  }

  async updateApartment(id: string, updateApartment: UpdateApartmentDto) {
    const apartment = await this.apartmentRepository.findOne({ id });
    if (!apartment) {
      throw new NotFoundException('Apartment not found');
    }

    if (apartment.bookingStatus == 'UNBOOKED' && updateApartment.gender) {
      apartment.gender = updateApartment.gender;
    }

    if (updateApartment.descriptionAr) {
      apartment.descriptionAr = updateApartment.descriptionAr;
    }

    if (updateApartment.descriptionEn) {
      apartment.descriptionEn = updateApartment.descriptionEn;
    }

    return await this.apartmentRepository.save(apartment);
  }

  async uploadDocuments(id: string, document: string) {
    const apartment = await this.apartmentRepository.findOne({ id });
    if (!apartment) {
      throw new NotFoundException('Apartment not found');
    }
    console.log(apartment.status);
    apartment.status = 'APPROVED';
    const apartmentDocument = await this.apartmentDocumentRepo.create({
      document,
      apartment,
    });
    await this.apartmentDocumentRepo.save(apartmentDocument);
    apartment.document = apartmentDocument;
    return await this.apartmentRepository.save(apartment);
  }

  async publishApartment(userId: string, apartmentId) {
    const apartment = await this.apartmentRepository.findOneBy({
      id: apartmentId,
    });
    const provider = await this.providerRepository.findOneBy({ userId });
    if (!provider) {
      throw new NotFoundException('provider not found');
    }

    if (!apartment) {
      throw new NotFoundException('apartment not found');
    }

    if (
      apartment.status == 'APPROVED' &&
      this.providerSubscriptionService.checkSubscriptionLimit(provider.id)
    ) {
      apartment.status = 'PUBLISHED';
      this.providerSubscriptionService.reduceMaxApartments(provider.id);
    }
    await this.apartmentRepository.save(apartment);
    return apartment;
  }

  async getById(id: string) {
    const apartment = await this.apartmentRepository.findOneBy({ id });
    if (!apartment) {
      throw new NotFoundException('apartment not found');
    }
    await this.apartmentRepository.save(apartment);
    return apartment;
  }

  async getRecentApartments(limit?: number): Promise<Apartment[]> {
    const findOptions: FindManyOptions<Apartment> = {
      order: { createdAt: 'DESC' },
      relations: ['rooms', 'rooms.beds']
    };
  
    // Only add take if limit is provided and valid
    if (limit && limit > 0) {
      findOptions.take = limit;
    }
  
    return this.apartmentRepository.find(findOptions);
  }

  async getRecentlyViewed(limit = 6): Promise<Apartment[]> {
    return this.apartmentRepository.find({
      where: { lastViewedAt: Not(IsNull()) },
      order: { lastViewedAt: 'DESC' },
      take: limit,
      relations: ['rooms', 'rooms.beds'],
    });
  }

  async updateLastViewed(id: string): Promise<Apartment> {
    const apartment = await this.apartmentRepository.findOne({ id });

    if (!apartment) {
      throw new Error('Apartment not found');
    }

    apartment.lastViewedAt = new Date();
    return this.apartmentRepository.save(apartment);
  }
  //filter by price
  async getApartmentsByBedPrice(
    minPrice: number,
    maxPrice: number,
    page: number,
    limit: number,
  ): Promise<{
    data: Apartment[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const [data, total] = await this.apartmentRepository
      .createQueryBuilder('apartment')
      .leftJoinAndSelect('apartment.rooms', 'room')
      .leftJoinAndSelect('room.beds', 'bed')
      .where('bed.price BETWEEN :minPrice AND :maxPrice', {
        minPrice,
        maxPrice,
      })
      .take(limit)
      .skip((page - 1) * limit) // Offset for pagination
      .getManyAndCount(); // Get data + total count

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getApartment(id: string,studentId?: string) {
    const apartment = await this.apartmentRepository.findOne(
      { id, status: 'APPROVED' },//SHOULD BE PUBLISHED
      ['provider', 'rooms', 'rooms.beds'],
    );

    if (!apartment) {
      throw new NotFoundException('Apartment not found');
    }
    let favoriteApartmentIds: string[] = [];
    if (studentId) {
      const favoriteApartments = await this.favoriteApartmentRepository.find({
        where: { favorite: { student: { id: studentId } } },
        relations: ['apartment'],
      });

      favoriteApartmentIds = favoriteApartments.map((fa) => fa.apartment.id);
    }

    // Add `isFavorite` field to each apartment
    const markFavorite = (apartment: Apartment) => ({
      ...apartment,
      isFavorite: favoriteApartmentIds.includes(apartment.id),
    });

    const response = {
      provider: apartment.provider, // Keep provider at the top level
      apartment: {
        ...apartment, // Spread all apartment properties inside user
        isFavorite: favoriteApartmentIds.includes(apartment.id),
      },
    };
  
    // Remove `provider` from `user` object
    delete response.apartment.provider;
  
    return response;
  }

  async getApartmentBoard(id: string) {
    const apartment = await this.apartmentRepository.findOne({ id }, [
      'provider',
      'rooms',
      'rooms.beds',
    ]);

    if (!apartment) {
      throw new NotFoundException('Apartment not found');
    }

    return apartment;
  }

  async getApartments(filters: GetApartmentsDto) {
    const { gender, minPrice, maxPrice, page, limit } = filters;

    const query = this.apartmentRepository.createQueryBuilder('apartment');

    if (gender) {
      query.andWhere('apartment.gender = :gender', { gender });
    }

    if (minPrice !== undefined) {
      query.andWhere('apartment.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      query.andWhere('apartment.price <= :maxPrice', { maxPrice });
    }

    // TODO: Location filter (to be implemented)

    query.orderBy('apartment.createdAt', 'DESC');

    const take = limit || 10;
    const skip = (page - 1) * take;

    query.skip(skip).take(take);

    const [data, total] = await query.getManyAndCount();

    return {
      total,
      page,
      limit,
      data,
    };
  }

  async getHomeData(studentId?: string) {
    const numberOfApartments = await this.apartmentRepository.count();

    const numberOfBeds = await this.apartmentRepository
      .createQueryBuilder('apartment')
      .leftJoin('apartment.rooms', 'room')
      .leftJoin('room.beds', 'bed')
      .select('COUNT(bed.id)::int', 'totalBeds')
      .getRawOne();

    const numberOfProviders = await this.providerRepository.count();
    const numberOfStudents = await this.studentRepository.count();
    const recentlyAdded = await this.getRecentApartments(6);
    const recentlyViewed = await this.getRecentlyViewed(6);
    const apartmentsByLocation = await this.getApartmentsByLocation(
      ApartmentLocation.ELSAIDY,
      6,
      1,
    );

    // Fetch the favorite apartments for this student
    let favoriteApartmentIds: string[] = [];
    if (studentId) {
      const favoriteApartments = await this.favoriteApartmentRepository.find({
        where: { favorite: { student: { id: studentId } } },
        relations: ['apartment'],
      });

      favoriteApartmentIds = favoriteApartments.map((fa) => fa.apartment.id);
    }

    // Add `isFavorite` field to each apartment
    const markFavorite = (apartments: Apartment[]) =>
      apartments.map((apartment) => ({
        ...apartment,
        isFavorite: favoriteApartmentIds.includes(apartment.id),
      }));

    return {
      numberOfApartments,
      numberOfBeds: parseInt(numberOfBeds.totalBeds, 10) || 0,
      numberOfProviders,
      numberOfStudents,
      recentlyAdded: markFavorite(recentlyAdded),
      recentlyViewed: markFavorite(recentlyViewed),
      apartmentsByLocation: markFavorite(apartmentsByLocation),
    };
  }

  async getApartmentsByLocation(
    location: ApartmentLocation,
    limit: number,
    page: number,
  ) {
    return this.apartmentRepository.find({
      where: { locationEnum: location },
      take: limit,
      skip: (page - 1) * limit,
      relations: ['rooms', 'rooms.beds'],
    });
  }

  async getBlockedApartments() {
    const blockedApartments = this.apartmentRepository
      .createQueryBuilder('apartment')
      .where('apartment.status = :status', { status: 'BLOCKED' })
      .getMany();
    return blockedApartments;
  }
}
