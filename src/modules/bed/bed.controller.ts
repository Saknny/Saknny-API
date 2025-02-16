import { Controller, Post, Param, UploadedFiles, UseInterceptors, Patch, UploadedFile, NotFoundException, Delete, Body } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BedService } from './bed.service';
import { bedImageUploadInterceptor } from './interceptors/interceptor.upload-file';
import { CreateBedDto } from './dto/create-bed.dto/create-bed.dto';
import { UpdateBedDto } from './dto/update-bed.dto/update-bed.dto';

@Controller('beds')
export class BedController {
    constructor(private readonly bedService: BedService) { }



    @Post(':id/create')
    async createBed(@Param('id') roomId: string,
        @Body() createBedDto: CreateBedDto) {
        return this.bedService.createBed(roomId, createBedDto);
    }

    @Patch(':id/update')
    async updateBed(@Param('id') bedId: string,
        @Body() updateBedDto: UpdateBedDto) {
        return this.bedService.updateBed(bedId, updateBedDto);
    }

    @Delete(':id/delete')
    async deleteBed(@Param('id') BedId: string) {
        return this.bedService.deleteBed(BedId);
    }


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
    async uploadBedImages(@Param('id') id: string, @UploadedFiles() files: { images?: Express.Multer.File[] }) {
        const imageFilenames = files.images?.map(file => file.filename) || [];
        return this.bedService.saveBedImages(id, imageFilenames);
    }


    @Patch(':id/update-image')
    @UseInterceptors(bedImageUploadInterceptor())
    async updateBedImage(
        @Param('id') imageId: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        if (!file) {
            throw new NotFoundException('No file uploaded');
        }
        return this.bedService.updateBedImage(imageId, file.filename);
    }


    @Delete(':id/delete-image')
    async deleteBedImage(@Param('id') imageId: string) {
        return this.bedService.deleteBedImage(imageId);
    }
}
