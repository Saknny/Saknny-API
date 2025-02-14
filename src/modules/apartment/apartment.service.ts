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
    ) { }

    async createApartment(providerId: string
        , createApartmentDto: CreateApartmentDto): Promise<Apartment> {
        const { descriptionEn, descriptionAr, images, rooms } = createApartmentDto;

        // Find the provider
        const provider = await this.providerRepository.findOne({ userId: providerId });
        if (!provider) {
            throw new NotFoundException('Provider not found');
        }

        // Create the apartment
        const apartment = this.apartmentRepository.create({
            descriptionEn,
            descriptionAr,
            images,
            provider,
        });

        await this.apartmentRepository.save(apartment);

        // Create rooms and beds
        for (const roomDto of rooms) {
            const { descriptionEn, descriptionAr, images, bedCount, availableFor, hasAirConditioner, beds } = roomDto;

            const room = this.roomRepository.create({
                descriptionEn,
                descriptionAr,
                images,
                bedCount,
                availableFor,
                hasAirConditioner,
                apartment,
            });

            await this.roomRepository.save(room);

            // Create beds for the room
            for (const bedDto of beds) {
                const { descriptionEn, descriptionAr, image, price } = bedDto;
                const bed = this.bedRepository.create({
                    descriptionEn,
                    descriptionAr,
                    image,
                    price,
                    room,
                });
                await this.bedRepository.save(bed);
            }
        }

        return apartment;
    }
    async getById(id: string) {
        const apartment = await this.apartmentRepository.findOneBy({ id });
        if (!apartment) {
            throw new NotFoundException('apartment not found');
        }
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
