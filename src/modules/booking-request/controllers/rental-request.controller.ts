import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RentalRequestService } from '../services/rental-request.service';
import { RenewRequestDto } from '../dtos/renew-request.dto';
import { CreateRentalRequestDto } from '../dtos/create-rental-request.dto';
import { currentUser } from '@src/libs/decorators/currentUser.decorator';
import { User } from '@src/modules/user/entities/user.entity';

@Controller('rental-requests')
export class RentalRequestController {
  constructor(private readonly rentalRequestService: RentalRequestService) {}

  @Post()
  async createRequest(
    @Body() body: CreateRentalRequestDto,
    @currentUser() user: User,
  ) {
    if (!user?.student) throw new NotFoundException('Student not found');

    return this.rentalRequestService.createRequest(
      user.student.id,
      body.bedId,
      body.price,
      body.duration,
    );
  }

  @Get()
  async getAllRequests() {
    return this.rentalRequestService.getAllRequests();
  }

  @Patch(':id/approve')
  async approveRequest(@Param('id') id: string) {
    return this.rentalRequestService.approveRequest(id);
  }

  @Patch(':id/reject')
  async rejectRequest(@Param('id') id: string) {
    return this.rentalRequestService.rejectRequest(id);
  }

  @Patch(':id/cancel')
  async cancelRequest(@Param('id') id: string) {
    return this.rentalRequestService.cancelRequest(id);
  }

  @Patch(':id/renew')
  async renewRequest(@Param('id') id: string, @Body() body: RenewRequestDto) {
    return this.rentalRequestService.renewRequest(id, body.duration);
  }

  @Get('student/:studentId')
  async getRequestsForStudent(@currentUser() user: User) {
    if (!user?.student) throw new NotFoundException('Student not found');

    return this.rentalRequestService.getRequestsForStudent(user.student.id);
  }

  @Get('provider/:providerId')
  async getRequestsForProvider(@currentUser() user: User) {
    if (!user?.provider) throw new NotFoundException('Provider not found');

    return this.rentalRequestService.getRequestsForProvider(user.provider.id);
  }
}
