import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bed } from './entities/bed.entity/bed.entity';
import { BaseRepository } from '@src/libs/types/base-repository';
import { Apartment } from '../apartment/entities/apartment.entity/apartment.entity';
import { BedImage } from './entities/bedImage.entity';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { Room } from '../room/entities/room.entity/room.entity';
import { CreateBedDto } from './dto/create-bed.dto/create-bed.dto';
import { UpdateBedDto } from './dto/update-bed.dto/update-bed.dto';

@Injectable()
export class BedService {
    constructor(
        @InjectRepository(Bed)
        private readonly bedRepository: BaseRepository<Bed>,
        @InjectRepository(Apartment)
        private readonly apartmentRepository: BaseRepository<Apartment>,
        @InjectRepository(BedImage)
        private readonly imageRepo: BaseRepository<BedImage>,
        @InjectRepository(Room)
        private readonly roomRepo: BaseRepository<Room>,
    ) { }


    // 🔹 Create a new bed
    async createBed(roomId: string, createBedDto: CreateBedDto): Promise<Bed> {
        const room = await this.roomRepo.findOne({ id: roomId });

        if (!room) {
            throw new NotFoundException('Room not found');
        }

        const bed = this.bedRepository.create({
            ...createBedDto,
            room,
        });

        return await this.bedRepository.save(bed);
    }


    async updateBed(bedId: string, updateBedDto: UpdateBedDto): Promise<Bed> {
        const bed = await this.bedRepository.findOne({ id: bedId });

        if (!bed) {
            throw new NotFoundException('Bed not found');
        }

        Object.assign(bed, updateBedDto);
        return await this.bedRepository.save(bed);
    }


    async deleteBed(bedId: string): Promise<{ message: string }> {
        const bed = await this.bedRepository.findOne({ id: bedId });

        if (!bed) {
            throw new NotFoundException('Bed not found');
        }
        if (bed.status == 'AVAILABLE') {
            await this.bedRepository.remove(bed);
            return { message: 'Bed deleted successfully' };
        }

        return { message: 'Bed can not be deleted ' };


    }



    async saveBedImages(id: string, imageFilenames: string[]): Promise<Bed> {
        const bed = await this.bedRepository.findOne({ id }, ['room', 'room.apartment']);
        console.log(bed);
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

        bed.room.apartment.isReviewed = false;
        return this.bedRepository.save(bed);
    }


    async updateBedImage(id: string, newFilename: string): Promise<BedImage> {
        const image = await this.imageRepo.findOne({ id }, ['bed']);

        if (!image) {
            throw new NotFoundException('Image not found');
        }


        const oldImagePath = join(__dirname, '../../uploads/beds', image.imageUrl);
        try {
            await unlink(oldImagePath);
        } catch (err) {
            console.warn('Old image file not found or already deleted:', oldImagePath);
        }

        image.imageUrl = newFilename;
        return await this.imageRepo.save(image);
    }


    async deleteBedImage(id: string): Promise<{ message: string }> {
        const image = await this.imageRepo.findOne({ id }, ['bed']);

        if (!image) {
            throw new NotFoundException('Image not found');
        }

        const imagePath = join(__dirname, '../../uploads/beds', image.imageUrl);
        try {
            await unlink(imagePath);
        } catch (err) {
            console.warn('Image file not found or already deleted:', imagePath);
        }
        await this.imageRepo.delete(id);

        return { message: 'Image deleted successfully' };
    }
    
}
