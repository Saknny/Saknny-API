import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Bed } from './entities/bed.entity/bed.entity';
import { BaseRepository } from '@src/libs/types/base-repository';
import { Apartment } from '../apartment/entities/apartment.entity/apartment.entity';

import { Room } from '../room/entities/room.entity/room.entity';
import { CreateBedDto } from './dto/create-bed.dto/create-bed.dto';
import { UpdateBedDto } from './dto/update-bed.dto/update-bed.dto';
import { ErrorCodeEnum } from '@src/libs/application/exceptions/error-code.enum';

@Injectable()
export class BedService {
  constructor(
    @InjectRepository(Bed)
    private readonly bedRepository: BaseRepository<Bed>,
    @InjectRepository(Apartment)
    private readonly apartmentRepository: BaseRepository<Apartment>,
    @InjectRepository(Room)
    private readonly roomRepo: BaseRepository<Room>,
  ) {}

  // 🔹 Create a new bed
  async createBed(roomId: string, createBedDto: CreateBedDto): Promise<Bed> {
    const room = await this.roomRepo.findOne({ id: roomId });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const bed = this.bedRepository.create({
      ...createBedDto,
      room,
    });

    return await this.bedRepository.save(bed);
  }

  async updateBed(bedId: string, updateBedDto: UpdateBedDto): Promise<Bed> {
    const bed = await this.bedRepository.findOne({ id: bedId });

    if (!bed) {
      throw new NotFoundException('Bed not found');
    }

    Object.assign(bed, updateBedDto);
    return await this.bedRepository.save(bed);
  }

  async deleteBed(bedId: string): Promise<{ message: string }> {
    const bed = await this.bedRepository.findOne({ id: bedId });

    if (!bed) {
      throw new NotFoundException('Bed not found');
    }
    if (bed.status == 'AVAILABLE') {
      await this.bedRepository.remove(bed);
      return { message: 'Bed deleted successfully' };
    }

    return { message: 'Bed can not be deleted ' };
  }

  async getBed(id: string): Promise<Bed> {
    const bed = await this.bedRepository.findOne(
      { id, room: { apartment: { status: 'PUBLISHED' } } },
      ['room', 'student'],
    );

    if (!bed) {
      throw new NotFoundException("Bed doesn't exist");
    }

    return bed;
  }

  async getBedBoard(id: string): Promise<Bed> {
    const bed = await this.bedRepository.findOne({ id }, ['room', 'student']);

    if (!bed) {
      throw new NotFoundException("Bed doesn't exist");
    }

    return bed;
  }
}
