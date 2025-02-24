import {
  Controller,
  Post,
  Param,
  UploadedFiles,
  UseInterceptors,
  Patch,
  UploadedFile,
  NotFoundException,
  Delete,
  Body,
  forwardRef,
  Inject,
  Get,
} from '@nestjs/common';

import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto/update-room.dto';
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post(':id/create')
  async createRoom(
    @Param('id') apartmentId: string,
    @Body() createRoomDto: CreateRoomDto,
  ) {
    return this.roomService.createRoom(apartmentId, createRoomDto);
  }

  @Patch(':id/update')
  async updateRoom(
    @Param('id') roomId: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomService.updateRoom(roomId, updateRoomDto);
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
