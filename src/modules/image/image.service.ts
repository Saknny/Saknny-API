import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '@src/libs/types/base-repository';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { Image } from './image.entity';
import { EntityType } from '../request/entities/enum/entityType.enum';
import { ImageDto } from './dto/image.dto';

@Injectable()
export class ImageService {
    constructor(
        @InjectRepository(Image)
        private readonly imageRepo: BaseRepository<Image>,
    ) { }

    async uploadImages(enityId: string, entityType: EntityType, imageFilenames: string[]): Promise<Image[]> {

        const images = await imageFilenames.map(filename =>
            this.imageRepo.create({ imageUrl: filename, entityId: enityId, entityType: entityType })
        );
        console.log(images);
        return await this.imageRepo.save(images);

    }

    async updateImage(id: string, entityType: EntityType, newFilename: string): Promise<Image> {

        const image = await this.imageRepo.findOne({ id });

        if (!image) {
            throw new NotFoundException('Image not found');
        }

        const oldImagePath = join(__dirname, `../../uploads/${entityType}`, image.imageUrl);
        try {
            await unlink(oldImagePath);
        } catch (err) {
            console.warn('Old image file not found or already deleted:', oldImagePath);
        }

        image.imageUrl = newFilename;
        return await this.imageRepo.save(image);
    }


    async deleteImage(id: string, entityType: EntityType): Promise<{ message: string }> {
        const image = await this.imageRepo.findOne({ id });

        if (!image) {
            throw new NotFoundException('Image not found');
        }

        const imagePath = join(__dirname, `../../uploads/${entityType}`, image.imageUrl);
        try {
            await unlink(imagePath);
        } catch (err) {
            console.warn('Image file not found or already deleted:', imagePath);
        }

        await this.imageRepo.delete(id);

        return { message: 'Image deleted successfully' };
    }


    async getImage(imageDto:ImageDto){
        const images = await this.imageRepo.findBy({entityId:imageDto.entityId , entityType: imageDto.entityType});
        console.log(images);
        return images;
    }
}


