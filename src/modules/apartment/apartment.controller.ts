import { Body, Controller, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApartmentService } from './apartment.service';
import { CreateApartmentDto } from './dto/create-apartment.dto/create-apartment.dto';
import { currentUser } from '../../libs/decorators/currentUser.decorator';
import { currentUserType } from '@src/libs/types/current-user.type';
import { extname } from 'path';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
@Controller('apartment')
export class ApartmentController {
  constructor(private readonly apartmentService: ApartmentService) {}

  @Post("create")
  
  async createApartment(@currentUser() { id }: currentUserType,
  @Body() createApartmentDto: CreateApartmentDto) {
    return this.apartmentService.createApartment(id,createApartmentDto);
  }
  @Post(':id/upload-images')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 10 }], {
      storage: diskStorage({
          destination: './uploads/apartments',
          filename: (req, file, callback) => {
              const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
              callback(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
          },
      }),
  }))
  async uploadApartmentImages(@Param('id') id: string, @UploadedFiles() files: { images?: Express.Multer.File[] }) {
      const imageFilenames = files.images?.map(file => file.filename) || [];
      return this.apartmentService.saveApartmentImages(id, imageFilenames);
  }
}
