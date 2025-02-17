import { Body, Controller, Delete, NotFoundException, Param, Patch, Post, UploadedFile, UploadedFiles, UseInterceptors, Get, Query, forwardRef, Inject } from '@nestjs/common';
import { ApartmentService } from './apartment.service';
import { CreateApartmentDto } from './dto/create-apartment.dto/create-apartment.dto';
import { currentUser } from '../../libs/decorators/currentUser.decorator';
import { currentUserType } from '@src/libs/types/current-user.type';
import { extname } from 'path';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { apartmentImageUploadInterceptor } from './interceptors/file-upload.interceptor';
import { Apartment } from './entities/apartment.entity/apartment.entity';
import { UpdateApartmentDto } from './dto/update-apartment.dto/update-apartment.dto';
import { PendingRequestService } from '../request/pendingRequest.service';
import { EntityType } from '../request/entities/enum/entityType.enum';
import { ReferenceType } from '../request/entities/enum/referenceType.enum';
import { Type } from '../request/entities/enum/type.enum';
import { fileUploadInterceptor } from './interceptors/document.interceptor';

@Controller('apartment')
export class ApartmentController {
  constructor(private readonly apartmentService: ApartmentService,
    @Inject(forwardRef(() => PendingRequestService))
    private readonly pendingRequestService: PendingRequestService
  ) { }

  @Post("create")
  async createApartment(@currentUser() { id }: currentUserType,
    @Body() createApartmentDto: CreateApartmentDto) {
    console.log(createApartmentDto);
    return this.apartmentService.createApartment(id, createApartmentDto);
  }

  @Post(':id/Apartment-document')
  @UseInterceptors(fileUploadInterceptor())
  async apartmentDocument(
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      document?: Express.Multer.File[]
    }
  ) {
    const document = files.document[0].buffer.toString('base64');
    return this.apartmentService.uploadDocuments(id, document)
  }

  @Patch(":id/update")
  async updateApartment(@Param('id') id: string,
    @Body() updateApartmentDto: UpdateApartmentDto) {
    console.log(updateApartmentDto);
    return this.apartmentService.updateApartment(id, updateApartmentDto);
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
  async uploadApartmentImages(@Param('id') id: string, @UploadedFiles() files: { images?: Express.Multer.File[] }, @currentUser() user: currentUserType) {
    const imageFilenames = files.images?.map(file => file.filename) || [];

    return this.pendingRequestService.uploadImageRequest(user.id, id, Type.UPLOAD_APARTMENT, ReferenceType.APARTMENT_IMAGE, EntityType.APARTMENT, imageFilenames);

  }


  @Patch(':id/update-image')
  @UseInterceptors(apartmentImageUploadInterceptor())
  async updateApartmentImage(
    @Param('id') imageId: string,
    @UploadedFile() file: Express.Multer.File,
    @currentUser() user: currentUserType
  ) {
    if (!file) {
      throw new NotFoundException('No file uploaded');
    }
    return this.pendingRequestService.uploadImageRequest(user.id, imageId, Type.UPDATE_APARTMENT, ReferenceType.APARTMENT_IMAGE, EntityType.APARTMENT, file.filename);
  }


  @Delete(':id/delete-image')
  async deleteApartmentImage(@Param('id') imageId: string) {
    return this.apartmentService.deleteApartmentImage(imageId);
  }

  @Get('recent')
  async getRecentApartments(@Query('limit') limit?: number) {
    return this.apartmentService.getRecentApartments(limit);
  }

  // Get recently viewed apartments
  @Get('recently-viewed')
  async getRecentlyViewedApartments() {
    return this.apartmentService.getRecentlyViewed();
  }

  // Update lastViewedAt for an apartment
  @Patch(':id/view')
  async updateLastViewed(@Param('id') id: string) {
    return this.apartmentService.updateLastViewed(id);
  }

  //filter by price 
  @Get('filter-by-bed-price')
  async getApartmentsByBedPrice(
    @Query('minPrice') minPrice: number,
    @Query('maxPrice') maxPrice: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ): Promise<{ data: Apartment[]; total: number; page: number; totalPages: number }> {
    return this.apartmentService.getApartmentsByBedPrice(
      Number(minPrice),
      Number(maxPrice),
      Number(page),
      Number(limit)
    );
  }



}