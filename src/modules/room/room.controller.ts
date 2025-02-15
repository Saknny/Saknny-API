import { Controller, Post, Param, UploadedFiles, UseInterceptors, Patch, UploadedFile, NotFoundException, Delete } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RoomService } from './room.service';
import { roomImageUploadInterceptor } from './interceptors/interceptor.upload-file';

@Controller('room')
export class RoomController {
    constructor(private readonly roomService: RoomService) { }

    @Post(':id/upload-images')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 10 }], {
        storage: diskStorage({
            destination: './uploads/rooms',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                callback(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
            },
        }),
    }))
    async uploadRoomImages(@Param('id') id: string, @UploadedFiles() files: { images?: Express.Multer.File[] }) {
        const imageFilenames = files.images?.map(file => file.filename) || [];
        return this.roomService.saveRoomImages(id, imageFilenames);
    }

    @Patch(':id/update-image')
    @UseInterceptors(roomImageUploadInterceptor())
    async updateRoomImage(
        @Param('id') imageId: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        if (!file) {
            throw new NotFoundException('No file uploaded');
        }
        return this.roomService.updateRoomImage(imageId, file.filename);
    }


    @Delete(':id/delete-image')
    async deleteRoomImage(@Param('id') imageId: string) {
        return this.roomService.deleteRoomImage(imageId);
    }
}
