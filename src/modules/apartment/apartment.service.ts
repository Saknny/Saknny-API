import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Apartment } from './entities/apartment.entity/apartment.entity';
import { Provider } from '../provider/entities/provider.entity';
import { CreateApartmentDto } from './dto/create-apartment.dto/create-apartment.dto';
import { Room } from '../room/entities/room.entity/room.entity';
import { Bed } from '../bed/entities/bed.entity/bed.entity';
import { BaseRepository } from '@src/libs/types/base-repository';
import { currentUser } from '../../libs/decorators/currentUser.decorator';
import { Repository } from 'typeorm';
import { ApartmentImage } from './entities/apartmentImage.entity';

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
        @InjectRepository(ApartmentImage)
        private readonly imageRepo: BaseRepository<ApartmentImage>,
    ) { }

    async createApartment(providerId: string
        , createApartmentDto: CreateApartmentDto): Promise<Apartment> {
        const { descriptionEn, descriptionAr, rooms } = createApartmentDto;

        // Find the provider
        const provider = await this.providerRepository.findOne({ userId: providerId });
        if (!provider) {
            throw new NotFoundException('Provider not found');
        }

        // Create the apartment
        const apartment = this.apartmentRepository.create({
            descriptionEn,
            descriptionAr,
            provider,
        });

        await this.apartmentRepository.save(apartment);

        // Create rooms and beds
        for (const roomDto of rooms) {
            const { descriptionEn, descriptionAr, bedCount, availableFor, hasAirConditioner, beds } = roomDto;

            const room = this.roomRepository.create({
                descriptionEn,
                descriptionAr,
                bedCount,
                availableFor,
                hasAirConditioner,
                apartment,
            });

            await this.roomRepository.save(room);

            // Create beds for the room
            for (const bedDto of beds) {
                const { descriptionEn, descriptionAr, price } = bedDto;
                const bed = this.bedRepository.create({
                    descriptionEn,
                    descriptionAr,
                    price,
                    room,
                });
                await this.bedRepository.save(bed);
            }
        }

        return apartment;
    }



    async saveApartmentImages(id: string, imageFilenames: string[]): Promise<Apartment> {
        const apartment = await this.apartmentRepository.findOne({ id })
        if (!apartment) {
            throw new NotFoundException('Apartment not found');
        }

        const images = imageFilenames.map(filename =>
            this.imageRepo.create({ imageUrl: filename, apartment })
        );

        await this.imageRepo.save(images);

        apartment.images = await this.imageRepo.find({
            where: { apartment: { id: apartment.id } },
        });

        apartment.isReviewed = false;
        return await this.apartmentRepository.save(apartment);
    }


    async getById(id: string) {
        const apartment = await this.apartmentRepository.findOneBy({ id });
        if (!apartment) {
            throw new NotFoundException('apartment not found');
        }
        apartment.isReviewed = true;
        await this.apartmentRepository.save(apartment);
        return apartment
    }

    async updateApartmentApproval(id: string, isTrusted: boolean): Promise<Apartment> {
        const apartment = await this.apartmentRepository.findOneBy({ id });
        if (!apartment) {
            throw new NotFoundException(`apartment not found`);
        }
        apartment.isTrusted = isTrusted;
        return this.apartmentRepository.save(apartment);
    }

    async getUnReviewedApartments(): Promise<Apartment[]> {
        return this.apartmentRepository.find({
            where: {
                isReviewed: false
            },
        });
    }


}
