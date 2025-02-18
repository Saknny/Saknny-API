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
import { ApartmentImage } from './entities/apartmentImage.entity';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { UpdateApartmentDto } from './dto/update-apartment.dto/update-apartment.dto';
import { ApartmentDocument } from './entities/document.entity';

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

        @InjectRepository(ApartmentDocument)
        private readonly apartmentDocumentRepo: BaseRepository<ApartmentDocument>,
    ) { }

    async createApartment(providerId: string
        , createApartmentDto: CreateApartmentDto): Promise<Apartment> {
        const { descriptionEn, descriptionAr, rooms, gender } = createApartmentDto;

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
            gender,
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

    async updateApartment(id: string, updateApartment: UpdateApartmentDto) {
        const apartment = await this.apartmentRepository.findOne({ id })
        if (!apartment) {
            throw new NotFoundException('Apartment not found');
        }


        if (apartment.status == "UNBOOKED" && updateApartment.gender) {
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


    async uploadDocuments(id: string, document: string) {
        const apartment = await this.apartmentRepository.findOne({ id })
        if (!apartment) {
            throw new NotFoundException('Apartment not found');
        }


        const apartmentDocument = await this.apartmentDocumentRepo.create({ document, apartment })
        await this.apartmentDocumentRepo.save(apartmentDocument);
        apartment.document = apartmentDocument;
        return await this.apartmentRepository.save(apartment);
    }


    async updateApartmentImage(id: string, newFilename: string): Promise<ApartmentImage> {
        const image = await this.imageRepo.findOne({ id }, ['apartment']);

        if (!image) {
            throw new NotFoundException('Image not found');
        }

        // 🔹 Delete old image from storage
        const oldImagePath = join(__dirname, '../../uploads/apartments', image.imageUrl);
        try {
            await unlink(oldImagePath);
        } catch (err) {
            console.warn('Old image file not found or already deleted:', oldImagePath);
        }


        image.imageUrl = newFilename;
        return await this.imageRepo.save(image);
    }


    async deleteApartmentImage(id: string): Promise<{ message: string }> {
        const image = await this.imageRepo.findOne({ id }, ['apartment']);

        if (!image) {
            throw new NotFoundException('Image not found');
        }


        const imagePath = join(__dirname, '../../uploads/apartments', image.imageUrl);
        try {
            await unlink(imagePath);
        } catch (err) {
            console.warn('Image file not found or already deleted:', imagePath);
        }


        await this.imageRepo.delete(id);

        return { message: 'Image deleted successfully' };
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
        limit: number
    ): Promise<{ data: Apartment[]; total: number; page: number; totalPages: number }> {
        const [data, total] = await this.apartmentRepository
            .createQueryBuilder('apartment')
            .leftJoinAndSelect('apartment.rooms', 'room')
            .leftJoinAndSelect('room.beds', 'bed')
            .where('bed.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice })
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


}
