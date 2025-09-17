import {
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { PendingRequestService } from '../request/pendingRequest.service';
import { CreateRoomDto } from './dto/create-room.dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto/update-room.dto';
import { RoomService } from './room.service';
@Controller('room')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    @Inject(forwardRef(() => PendingRequestService))
    private readonly pendingRequestService: PendingRequestService,
  ) {}

  @Post(':id/create')
  async createRoom(
    @Param('id') apartmentRequestId: string,
    @Body() createRoomDto: CreateRoomDto,
  ) {
    return this.pendingRequestService.addRoomRequest(
      apartmentRequestId,
      createRoomDto,
    );
  }

  @Patch(':id/updateInfo')
  async updateRoomInfo(
    @Param('id') roomId: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomService.updateRoom(roomId, updateRoomDto);
  }

  @Post(':id/:requestId/updateRequest')
  async updateRoomRequest(
    @Param('id') roomId: string,
    @Param('requestId') requestId: string,
  ) {
    return this.pendingRequestService.updateRoomRequest(roomId, requestId);
  }

  @Delete(':id/delete')
  async deleteRoom(@Param('id') roomId: string) {
    return this.roomService.deleteRoom(roomId);
  }

  @Get(':id')
  async getRoom(@Param('id') roomId: string) {
    return this.roomService.getRoom(roomId);
  }

  @Get(':id/board')
  async getRoomBoard(@Param('id') roomId: string) {
    return this.roomService.getRoomBoard(roomId);
  }
}
