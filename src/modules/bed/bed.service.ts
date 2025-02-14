import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bed } from './entities/bed.entity/bed.entity';
import { BaseRepository } from '@src/libs/types/base-repository';
import { Apartment } from '../apartment/entities/apartment.entity/apartment.entity';

@Injectable()
export class BedService {
    constructor(
        @InjectRepository(Bed)
        private readonly bedRepository: BaseRepository<Bed>,
        @InjectRepository(Apartment)
        private readonly apartmentRepository: BaseRepository<Apartment>,
    ) { }

    async saveBedImages(id: string, imageFilenames: string[]): Promise<Bed> {
        const bed = await this.bedRepository.findOne({ id });

        if (!bed) {
            throw new NotFoundException('Bed not found');
        }

        bed.images = [...(bed.images || []), ...imageFilenames];
        bed.room.apartment.isReviewed = false;

        this.apartmentRepository.save(bed.room.apartment);
        return this.bedRepository.save(bed);
    }
}
