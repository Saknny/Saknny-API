import { Body, Controller, Post } from '@nestjs/common';
import { ApartmentService } from './apartment.service';
import { CreateApartmentDto } from './dto/create-apartment.dto/create-apartment.dto';
import { currentUser } from '../../libs/decorators/currentUser.decorator';
import { currentUserType } from '@src/libs/types/current-user.type';
@Controller('apartment')
export class ApartmentController {
  constructor(private readonly apartmentService: ApartmentService) {}

  @Post("create")
  
  async createApartment(@currentUser() { id }: currentUserType,
  @Body() createApartmentDto: CreateApartmentDto) {
    return this.apartmentService.createApartment(id,createApartmentDto);
  }
}
