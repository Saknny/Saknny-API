import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '@src/libs/types/base-repository';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { Image } from './image.entity';
import { EntityType } from '../request/entities/enum/entityType.enum';
import { ImageDto } from './dto/image.dto';
import { ApartmentImagesResponseDto } from '../apartment/dto/image-response.dto';
import { Apartment } from '../apartment/entities/apartment.entity/apartment.entity';

@Injectable()
export class ImageService {
    constructor(
        @InjectRepository(Image)
        private readonly imageRepo: BaseRepository<Image>,
        @InjectRepository(Apartment)
        private readonly apartmentRepo: BaseRepository<Apartment>,
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

    async getApartmentImages(apartmentId: string): Promise<ApartmentImagesResponseDto> {
        const baseUrl = 'http://localhost:4000'
        const uploadPath = '/uploads'
        // Get apartment images
        const updateId = ( id: string ): string => {
            return id.replace(/-/g, '').toUpperCase().trim();
          };
        // Get apartment images with full URL
        const apartmentImages = (await this.imageRepo.find({
          where: {
            entityType: EntityType.APARTMENT,
            entityId: updateId(apartmentId)
          }
        })).map(img => ({
          ...img,
          imageUrl: `${baseUrl}${uploadPath}/${img.entityType}/${img.imageUrl}`
        }));
        console.log(apartmentImages)
        // Get all rooms for the apartment
        const apartmentWithRooms = await this.apartmentRepo
        .createQueryBuilder('apartment')
        .leftJoinAndSelect('apartment.rooms', 'room')
        .leftJoinAndSelect('room.beds', 'bed')
        .where('apartment.id = :apartmentId', { apartmentId })
        .getOne();

        console.log(apartmentWithRooms)
      
        if (!apartmentWithRooms) {
          throw new NotFoundException('Apartment not found');
        }
      
        // Get all room IDs and bed IDs
        const roomIds = apartmentWithRooms.rooms.map(room => updateId(room.id));
        const bedIds = apartmentWithRooms.rooms.flatMap(room => 
          room.beds.map(bed => updateId(bed.id))
        );
      
        // Get all room images in one query
        console.log("room ids after update ")
        console.log( roomIds.map(id=> updateId(id)));
        // Get room images with full URL
        const roomImages = (await this.imageRepo
          .createQueryBuilder('image')
          .where('image.entityType = :type AND image.entityId IN (:...ids)', {
            type: EntityType.ROOM,
            ids: roomIds.map(updateId)
          })
          .getMany()).map(img => ({
            ...img,
            imageUrl: `${baseUrl}${uploadPath}/${img.entityType}/${img.imageUrl}`
          }));

        // Get bed images with full URL
        const bedImages = (await this.imageRepo
          .createQueryBuilder('image')
          .where('image.entityType = :type AND image.entityId IN (:...ids)', {
            type: EntityType.BED,
            ids: bedIds.map(updateId)
          })
          .getMany()).map(img => ({
            ...img,
            imageUrl: `${baseUrl}${uploadPath}/${img.entityType}/${img.imageUrl}`
          }));
        console.log(bedImages)
      
        // Structure the response
        return {
            apartmentImages: apartmentImages.map(img => ({
              id: img.id,
              entityType: img.entityType,
              imageUrl: img.imageUrl
            })),
            rooms: apartmentWithRooms.rooms.map(room => ({
              roomId: room.id, // Only return room ID
              roomImages: roomImages
                .filter(img => img.entityId === updateId(room.id))
                .map(img => ({
                  id: img.id,
                  entityType: img.entityType,
                  imageUrl: img.imageUrl
                })),
              beds: room.beds.map(bed => ({
                bedId: bed.id, // Only return bed ID
                bedImages: bedImages
                  .filter(img => img.entityId === updateId(bed.id))
                  .map(img => ({
                    id: img.id,
                    entityType: img.entityType,
                    imageUrl: img.imageUrl
                  }))
              }))
            }))
          };
      }
}


