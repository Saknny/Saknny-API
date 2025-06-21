import {
  Body,
  Controller,
  Get,
  NotFoundException,
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

    @Get('student')
    async getRequestsForStudent(@currentUser() user: User) {
      if (!user?.student) throw new NotFoundException('Student not found');
  
      return this.rentalRequestService.getRoomRequestsForStudent(user.student.id);
    }
  
    @Get('provider')
    async getRequestsForProvider(@currentUser() user: User) {
      if (!user?.provider) throw new NotFoundException('Provider not found');
  
      return this.rentalRequestService.getRoomRequestsForProvider(user.provider.id);
    }

  @Get()
  async getRequests(  ) {
    return this.rentalRequestService.getAllRoomRequests();
  }

    @Get(":id")
  async getRequest( @Param('id') id:string ) {
    return this.rentalRequestService.getRoomRequest(id);
  }



}
