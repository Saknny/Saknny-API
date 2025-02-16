import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity/room.entity';
import { BaseRepository } from '@src/libs/types/base-repository';
import { ApartmentService } from '../apartment/apartment.service';
import { Apartment } from '../apartment/entities/apartment.entity/apartment.entity';
import { RoomImage } from './entities/roomImage.entity';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { CreateRoomDto } from './dto/create-room.dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto/update-room.dto';

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

    async createRoom(apartmentId: string, createRoomDto: CreateRoomDto): Promise<Room> {
        const apartment = await this.apartmentRepo.findOne({ id: apartmentId });

        if (!apartment) {
            throw new NotFoundException('Apartment not found');
        }

        const room = this.roomRepository.create({
            ...createRoomDto,
            apartment, 
        });

        return await this.roomRepository.save(room);
    }


    async updateRoom(roomId: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
        const room = await this.roomRepository.findOne({ id: roomId });

        if (!room) {
            throw new NotFoundException('Room not found');
        }

        Object.assign(room, updateRoomDto);
        return await this.roomRepository.save(room);
    }

 
    async deleteRoom(roomId: string): Promise<{ message: string }> {
        const room = await this.roomRepository.findOne({ id: roomId });

        if (!room) {
            throw new NotFoundException('Room not found');
        }

        await this.roomRepository.remove(room);
        return { message: 'Room deleted successfully' };
    }

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

        room.apartment.isReviewed = false;
        return this.roomRepository.save(room);
    }

    async updateRoomImage(id: string, newFilename: string): Promise<RoomImage> {
        const image = await this.imageRepo.findOne({ id }, ['room']);

        if (!image) {
            throw new NotFoundException('Image not found');
        }


        const oldImagePath = join(__dirname, '../../uploads/rooms', image.imageUrl);
        try {
            await unlink(oldImagePath);
        } catch (err) {
            console.warn('Old image file not found or already deleted:', oldImagePath);
        }

        image.imageUrl = newFilename;
        return await this.imageRepo.save(image);
    }


    async deleteRoomImage(id: string): Promise<{ message: string }> {
        const image = await this.imageRepo.findOne({ id }, ['room']);

        if (!image) {
            throw new NotFoundException('Image not found');
        }

        const imagePath = join(__dirname, '../../uploads/rooms', image.imageUrl);
        try {
            await unlink(imagePath);
        } catch (err) {
            console.warn('Image file not found or already deleted:', imagePath);
        }
        await this.imageRepo.delete(id);

        return { message: 'Image deleted successfully' };
    }
}
