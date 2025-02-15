import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bed } from './entities/bed.entity/bed.entity';
import { BaseRepository } from '@src/libs/types/base-repository';
import { Apartment } from '../apartment/entities/apartment.entity/apartment.entity';
import { BedImage } from './entities/bedImage.entity';
@Injectable()
export class BedService {
    constructor(
        @InjectRepository(Bed)
        private readonly bedRepository: BaseRepository<Bed>,
        @InjectRepository(Apartment)
        private readonly apartmentRepository: BaseRepository<Apartment>,
        @InjectRepository(BedImage)
        private readonly imageRepo: BaseRepository<BedImage>,
    ) { }

    async saveRoomImages(id: string, imageFilenames: string[]): Promise<Bed> {
        const bed = await this.bedRepository.findOne({ id }, ['room','room.apartment']);
        if (!bed) {
            throw new NotFoundException('Bed not found');
        }
        const images = imageFilenames.map(filename =>
            this.imageRepo.create({ imageUrl: filename, bed })
        );

        await this.imageRepo.save(images);

        bed.images = await this.imageRepo.find({
            where: { bed: { id: bed.id } },
        });
        bed.room.apartment.isReviewed=false;
        return this.bedRepository.save(bed);
    }
}
