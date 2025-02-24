import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Apartment } from './entities/apartment.entity/apartment.entity';
import { Provider } from '../provider/entities/provider.entity';
import { CreateApartmentDto } from './dto/create-apartment.dto/create-apartment.dto';
import { Room } from '../room/entities/room.entity/room.entity';
import { Bed } from '../bed/entities/bed.entity/bed.entity';
import { BaseRepository } from '@src/libs/types/base-repository';
import { currentUser } from '../../libs/decorators/currentUser.decorator';
import { Not, Repository, IsNull } from 'typeorm';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { UpdateApartmentDto } from './dto/update-apartment.dto/update-apartment.dto';
import { ApartmentDocument } from './entities/document.entity';
import { ErrorCodeEnum } from '@src/libs/application/exceptions/error-code.enum';
import { GetApartmentsDto } from './dto/get-apartments.dto';
import { Status } from '../request/entities/enum/status.enum';

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

    @InjectRepository(ApartmentDocument)
    private readonly apartmentDocumentRepo: BaseRepository<ApartmentDocument>,
  ) { }



  async createApartment(
    userId: string,
    createApartmentDto: CreateApartmentDto,
  ): Promise<Apartment> {
    const { descriptionEn, descriptionAr, gender } = createApartmentDto;


    const provider = await this.providerRepository.findOne({ userId });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const apartment = this.apartmentRepository.create({
      descriptionEn,
      descriptionAr,
      provider,
      gender,
    });

    await this.apartmentRepository.save(apartment);

    return apartment;
  }

  async updateApartment(id: string, updateApartment: UpdateApartmentDto) {
    const apartment = await this.apartmentRepository.findOne({ id });
    if (!apartment) {
      throw new NotFoundException('Apartment not found');
    }

    if (apartment.status == 'UNBOOKED' && updateApartment.gender) {
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

  async publishApartment(id: string) {
    const apartment = await this.apartmentRepository.findOneBy({ id });
    if (!apartment) {
      throw new NotFoundException('apartment not found');
    }
    if (apartment.status == 'APPROVED') {
      apartment.status = 'PUBLISHED';
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

  async getRecentApartments(limit = 10): Promise<Apartment[]> {
    return this.apartmentRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getRecentlyViewed(): Promise<Apartment[]> {
    return this.apartmentRepository.find({
      where: { lastViewedAt: Not(IsNull()) },
      order: { lastViewedAt: 'DESC' },
      take: 10, // Limit to 10 results
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

  async getApartment(id: string) {
    return this.apartmentRepository.findOneOrError(
      { id, status: 'PUBLISHED' },
      ErrorCodeEnum.APARTMENT_NOT_FOUND,
      ['provider', 'images', 'rooms', 'rooms.beds'],
    );
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
}
