import { Controller, Post, Param, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BedService } from './bed.service';

@Controller('beds')
export class BedController {
    constructor(private readonly bedService: BedService) {}

    @Post(':id/upload-images')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 10 }], {
        storage: diskStorage({
            destination: './uploads/beds',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                callback(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
            },
        }),
    }))
    async uploadRoomImages(@Param('id') id: string, @UploadedFiles() files: { images?: Express.Multer.File[] }) {
        const imageFilenames = files.images?.map(file => file.filename) || [];
        return this.bedService.saveRoomImages(id, imageFilenames);
    }
}
