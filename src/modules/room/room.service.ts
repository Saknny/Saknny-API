import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity/room.entity';
import { BaseRepository } from '@src/libs/types/base-repository';
import { ApartmentService } from '../apartment/apartment.service';
import { Apartment } from '../apartment/entities/apartment.entity/apartment.entity';

@Injectable()
export class RoomService {
    constructor(

        @InjectRepository(Room)
        private readonly roomRepository: BaseRepository<Room>,
        @InjectRepository(Apartment)
        private readonly apartmentRepo: BaseRepository<Apartment>
    ) { }

    async saveRoomImages(id: string, imageFilenames: string[]): Promise<Room> {
        const room = await this.roomRepository.findOne({ id });

        if (!room) {
            throw new NotFoundException('Room not found');
        }

        room.images = [...(room.images || []), ...imageFilenames];
        room.apartment.isReviewed = false;
        this.apartmentRepo.save(room.apartment);
        return this.roomRepository.save(room);
    }
}
