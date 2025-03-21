import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity/room.entity';
import { BaseRepository } from '@src/libs/types/base-repository';
import { ApartmentService } from '../apartment/apartment.service';
import { Apartment } from '../apartment/entities/apartment.entity/apartment.entity';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { CreateRoomDto } from './dto/create-room.dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto/update-room.dto';
import { ErrorCodeEnum } from '@src/libs/application/exceptions/error-code.enum';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: BaseRepository<Room>,
    @InjectRepository(Apartment)
    private readonly apartmentRepo: BaseRepository<Apartment>,
  ) {}

  async createRoom(
    apartmentId: string,
    createRoomDto: CreateRoomDto,
  ): Promise<Room> {
    const apartment = await this.apartmentRepo.findOne({ id: apartmentId });

    if (!apartment) {
      throw new NotFoundException('Apartment not found');
    }

    const room = this.roomRepository.create({
      ...createRoomDto,
      apartment,
    });

    return await this.roomRepository.save(room);
  }

  async updateRoom(
    roomId: string,
    updateRoomDto: UpdateRoomDto,
  ): Promise<Room> {
    const room = await this.roomRepository.findOne({ id: roomId });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    Object.assign(room, updateRoomDto);
    return await this.roomRepository.save(room);
  }

  async deleteRoom(roomId: string): Promise<{ message: string }> {
    const room = await this.roomRepository.findOne({ id: roomId });

    if (!room) {
      throw new NotFoundException('Room not found');
    }
    if (room.status == 'UNBOOKED') {
      await this.roomRepository.remove(room);
      return { message: 'Room deleted successfully' };
    } else {
      return { message: 'Room can not be deleted ' };
    }
  }

  async getRoom(roomId: string): Promise<Room> {
    const room = await this.roomRepository.findOne(
      { id: roomId, apartment: { status: 'PUBLISHED' } },
      ['apartment, beds'],
    );

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async getRoomBoard(roomId: string): Promise<Room> {
    const room = await this.roomRepository.findOne({ id: roomId }, [
      'apartment',
    ]);

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }
}
