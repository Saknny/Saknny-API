import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { currentUser } from '@src/libs/decorators/currentUser.decorator';
import { User } from '@src/modules/user/entities/user.entity';
import { RentalRequestService } from '../services/rental-request.service';

@Controller('room-requests')
export class RoomRentalController {
  constructor(private readonly rentalRequestService: RentalRequestService) {}

  @Post()
  async createRequest(
    @Body() body: { roomId: string; duration: number },
    @currentUser() user: User,
  ) {
    return this.rentalRequestService.createRoomRequest(
      user.student.id,
      body.roomId,
      body.duration,
    );
  }

  @Patch('/:id/approve')
  async approve(@Param('id') id: string) {
    return this.rentalRequestService.approveRoomRequest(id);
  }

  @Patch('/:id/reject')
  async reject(@Param('id') id: string) {
    return this.rentalRequestService.rejectRoomRequest(id);
  }

  @Get()
  async getRequests(
    @currentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.rentalRequestService.getAllRoomRequests(user.student.id, {
      page,
      limit,
    });
  }
}
