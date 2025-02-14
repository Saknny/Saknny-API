import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity/room.entity';
import { BaseRepository } from '@src/libs/types/base-repository';
import { ApartmentService } from '../apartment/apartment.service';
import { Apartment } from '../apartment/entities/apartment.entity/apartment.entity';
import { RoomImage } from './entities/roomImage.entity';

@Injectable()
export class RoomService {
    constructor(

        @InjectRepository(Room)
        private readonly roomRepository: BaseRepository<Room>,
        @InjectRepository(Apartment)
        private readonly apartmentRepo: BaseRepository<Apartment>,
        @InjectRepository(RoomImage)
        private readonly imageRepo: BaseRepository<RoomImage>,
        
    ) { }

    async saveRoomImages(id: string, imageFilenames: string[]): Promise<Room> {
        const room = await this.roomRepository.findOne({ id }, ['apartment']);
        if (!room) {
            throw new NotFoundException('Room not found');
        }

        const images = imageFilenames.map(filename =>
            this.imageRepo.create({ imageUrl: filename, room })
        );

        await this.imageRepo.save(images);

        room.images = await this.imageRepo.find({
            where: { room: { id: room.id } },
        });

        room.apartment.isReviewed =false;
        return this.roomRepository.save(room);
    }
}
