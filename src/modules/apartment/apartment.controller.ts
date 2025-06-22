import {
  Body,
  Controller,
  Delete,
  NotFoundException,
  Param,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Get,
  Query,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { ApartmentService } from './apartment.service';
import { CreateApartmentDto } from './dto/create-apartment.dto/create-apartment.dto';
import { currentUser } from '../../libs/decorators/currentUser.decorator';
import { currentUserType } from '@src/libs/types/current-user.type';
import { Apartment } from './entities/apartment.entity/apartment.entity';
import { UpdateApartmentDto } from './dto/update-apartment.dto/update-apartment.dto';
import { PendingRequestService } from '../request/pendingRequest.service';
import { fileUploadInterceptor } from './interceptors/document.interceptor';
import { GetApartmentsDto } from './dto/get-apartments.dto';
import { ApartmentLocation } from './enums/location.enum';
import { SearchApartmentsDto } from './dto/search-apartments.dto';
import { FilterApartmentsDto } from './dto/filter-apartments.dto';

@Controller('apartment')
export class ApartmentController {
  constructor(
    private readonly apartmentService: ApartmentService,
    @Inject(forwardRef(() => PendingRequestService))
    private readonly pendingRequestService: PendingRequestService,
  ) { }


  @Get(':id')
  async singleApartment(@Param('id') id:string){
    return this.apartmentService.getById(id)

  }
  @Post('create')
  async createApartment(
    @currentUser() { id }: currentUserType,
    @Body() createApartmentDto: CreateApartmentDto,
  ) {
    console.log(createApartmentDto);
    return this.pendingRequestService.createApartmentRequest(
      id,
      createApartmentDto,
    );
  }

  @Get("matching")
  async getRankedMatchingApartments(
    @currentUser() user: currentUserType
  ) {
    return this.apartmentService.getRankedMatchingApartments(user?.student?.id)
  }

  @Get('filter-by-gender')
async getApartmentsByGender( @currentUser() user: currentUserType,@Query() filterDto: FilterApartmentsDto) {
  return this.apartmentService.filterApartments(user?.student?.id,filterDto);
}

  @Post(':id/Apartment-document')
  @UseInterceptors(fileUploadInterceptor())
  async apartmentDocument(
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      document?: Express.Multer.File[];
    },
  ) {
    const document = files.document[0].buffer.toString('base64');
    await this.pendingRequestService.UploadDocRequest(id, document);
    // return await this.pendingRequestService.uploadDocumentRequest(id, document);
  }

  @Patch(':id/updateInfo')
  async updateApartmentInfo(
    @Param('id') id: string,
    @Body() updateApartmentDto: UpdateApartmentDto,
  ) {
    return this.apartmentService.updateApartment(id, updateApartmentDto);
  }

  @Post(':id/updateRequest')
  async updateApartmentRequest(
    @currentUser() user: currentUserType,
    @Param('id') id: string,
  ) {
    return this.pendingRequestService.updateApartmentRequest(id, user.id);
  }

  // search endpoint 
@Get('search')
async searchApartments(
  @Query() query: SearchApartmentsDto,
  @currentUser() user: currentUserType
) {
  return this.apartmentService.searchApartments(query, user);
}


  @Get('blocked-Apartments')
  async getBlockedApartments() {
    console.log('entered!');
    return await this.apartmentService.getBlockedApartments();
  }

  @Get('recent')
  async getRecentApartments( @currentUser() user: currentUserType,@Query('limit') limit?: number) {

    const apartments = await this.apartmentService.getRecentApartments(user?.id,limit ? Number(limit) : undefined);

    return {
      recentlyAdded: apartments
    };
  }

  // Get recently viewed apartments
  @Get('recently-viewed')
  async getRecentlyViewedApartments( @currentUser() user: currentUserType,@Query('limit') limit?: number ) {
    return this.apartmentService.getRecentlyViewed(user?.id,limit);
  }

  // Update lastViewedAt for an apartment
  @Patch(':id/view')
  async updateLastViewed(
    @Param('id') id: string,
    @currentUser() user: currentUserType, // Assuming this decorator gives you the user
  ) {
    return this.apartmentService.updateLastViewed(id, user.id);
  }

  @Get('locations')
  getLocations() {
    const locations = this.apartmentService.getApartmentLocations();
    return {
      locations,
    };
  }
  // TODO: we need one endpoint with different filters and sort
  //filter by price
  @Get('filter-by-bed-price')
  async getApartmentsByBedPrice(
    @Query('minPrice') minPrice: number,
    @Query('maxPrice') maxPrice: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{
    data: Apartment[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.apartmentService.getApartmentsByBedPrice(
      Number(minPrice),
      Number(maxPrice),
      Number(page),
      Number(limit),
    );
  }

  @Get('/home')
  async getHomeData(@currentUser() user: currentUserType) {
    return this.apartmentService.getHomeData(user?.student?.id, user);
  }

  @Get(':apartmentId')
  async getApartment(@Param('apartmentId') apartmentId: string
    , @currentUser() user: currentUserType) {
    return this.apartmentService.getApartment(apartmentId, user);
  }

  @Get(':apartmentId/board')
  async getApartmentBoard(@Param('apartmentId') apartmentId: string) {
    return this.apartmentService.getApartmentBoard(apartmentId);
  }

  @Get()
  async getApartments(@Query() filters: GetApartmentsDto) {
    return this.apartmentService.getApartments(filters);
  }

  @Get('/by-location')
  async getApartmentsByLocation(
    @Query('location') location: ApartmentLocation,
    @Query('limit') limit: number = 10,
    @Query('page') page: number = 1,
  ) {
    return this.apartmentService.getApartmentsByLocation(location, limit, page);
  }

  @Patch(':id/publish')
  async publishApartment(
    @Param('id') id: string,
    @currentUser() user: currentUserType,
  ) {
    return this.apartmentService.publishApartment(user.id, id);
  }




}
