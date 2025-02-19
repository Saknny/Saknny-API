import { Body, Controller, Delete, NotFoundException, Param, Patch, Post, UploadedFile, UploadedFiles, UseInterceptors, Get, Query, forwardRef, Inject } from '@nestjs/common';
import { ApartmentService } from './apartment.service';
import { CreateApartmentDto } from './dto/create-apartment.dto/create-apartment.dto';
import { currentUser } from '../../libs/decorators/currentUser.decorator';
import { currentUserType } from '@src/libs/types/current-user.type';
import { Apartment } from './entities/apartment.entity/apartment.entity';
import { UpdateApartmentDto } from './dto/update-apartment.dto/update-apartment.dto';
import { PendingRequestService } from '../request/pendingRequest.service';
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
    return await this.pendingRequestService.uploadDocumentRequest(id, document)
 
  }

  @Patch(":id/update")
  async updateApartment(@Param('id') id: string,
    @Body() updateApartmentDto: UpdateApartmentDto) {
    console.log(updateApartmentDto);
    return this.apartmentService.updateApartment(id, updateApartmentDto);
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

  @Patch(':id/publish')
  async publishApartment(@Param('id') id: string) {
    return this.apartmentService.publishApartment(id);
  }

}