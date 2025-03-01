import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectBaseRepository } from '@src/libs/decorators/inject-base-repository.decorator';
import { RentalRequest } from '../entity/rental-request.entity';
import { BaseRepository } from '@src/libs/types/base-repository';
import { Bed } from '@src/modules/bed/entities/bed.entity/bed.entity';
import { Apartment } from '@src/modules/apartment/entities/apartment.entity/apartment.entity';
import { Student } from '@src/modules/student/entities/student.entity';
import { Room } from '@src/modules/room/entities/room.entity/room.entity';
import { RentalStatusEnum } from '../enums/rental-status.enum';
import { In } from 'typeorm';

@Injectable()
export class RentalRequestService {
  constructor(
    @InjectBaseRepository(RentalRequest)
    private readonly rentalRequestRepo: BaseRepository<RentalRequest>,

    @InjectBaseRepository(Bed)
    private readonly bedRepo: BaseRepository<Bed>,

    @InjectBaseRepository(Apartment)
    private readonly apartmentRepo: BaseRepository<Apartment>,

    @InjectBaseRepository(Student)
    private readonly studentRepo: BaseRepository<Student>,

    @InjectBaseRepository(Room)
    private readonly roomRepo: BaseRepository<Room>,
  ) {}

  async createRequest(
    studentId: string,
    roomId: string,
    price: number,
    duration: number,
  ) {
    const student = await this.studentRepo.findOne({ id: studentId });

    if (!student) throw new BadRequestException('Student not found.');

    // Find an available bed in the room
    const room = await this.roomRepo.findOne({ id: roomId }, [
      'apartment',
      'beds',
    ]);

    if (!room) throw new BadRequestException('Room not found.');

    const availableBed = room.beds.find((bed) => bed.status === 'AVAILABLE');

    if (!availableBed) {
      throw new BadRequestException('No available beds in this room.');
    }

    const apartment = room.apartment;

    // Check gender compatibility
    if (apartment.gender && apartment.gender !== student.gender) {
      throw new BadRequestException(
        'Apartment gender restriction does not match student.',
      );
    }

    // Check if student has already requested any bed in this room
    const existingRequest = await this.rentalRequestRepo.findOne({
      student: { id: studentId },
      bed: { room: { id: roomId } },
      status: RentalStatusEnum.PENDING,
    });

    if (existingRequest) {
      throw new BadRequestException(
        'You have already requested a bed in this room.',
      );
    }

    // Create and save the rental request
    return await this.rentalRequestRepo.createOne({
      student,
      bed: availableBed,
      price,
      duration,
      status: RentalStatusEnum.PENDING,
    });
  }

  async approveRequest(requestId: string) {
    const request = await this.rentalRequestRepo.findOne({ id: requestId }, [
      'bed',
      'bed.room',
      'bed.room.apartment',
      'student',
    ]);

    if (!request || request.status !== RentalStatusEnum.PENDING) {
      throw new BadRequestException('Invalid request.');
    }

    request.status = RentalStatusEnum.ACCEPTED;
    await this.rentalRequestRepo.save(request);

    // Reserve bed
    const bed = request.bed;
    bed.status = 'RESERVED';
    bed.student = request.student;
    await this.bedRepo.save(bed);

    const apartment = bed.room.apartment;

    // If first approval and gender is not set, set it
    if (!apartment.gender) {
      apartment.gender = request.student.gender;
      await this.apartmentRepo.save(apartment);
    }

    // If all beds are reserved, mark apartment as booked
    const allBeds = await this.bedRepo.find({ where: { room: { apartment } } });
    if (allBeds.every((b) => b.status === 'RESERVED')) {
      apartment.bookingStatus = 'BOOKED';
      await this.apartmentRepo.save(apartment);
    }

    return request;
  }

  async rejectRequest(requestId: string) {
    const request = await this.rentalRequestRepo.findOne({ id: requestId });

    if (!request || request.status !== RentalStatusEnum.PENDING) {
      throw new BadRequestException('Invalid request.');
    }

    request.status = RentalStatusEnum.REJECTED;
    return this.rentalRequestRepo.save(request);
  }

  async cancelRequest(requestId: string) {
    const request = await this.rentalRequestRepo.findOne({ id: requestId }, [
      'bed',
      'bed.room.apartment',
    ]);

    if (!request || request.status !== RentalStatusEnum.ACCEPTED) {
      throw new BadRequestException('Only approved requests can be canceled.');
    }

    request.status = RentalStatusEnum.CANCELED;
    await this.rentalRequestRepo.save(request);

    const bed = request.bed;
    bed.status = 'AVAILABLE';
    bed.student = null;
    await this.bedRepo.save(bed);

    // Check if apartment should be unbooked
    const apartment = bed.room.apartment;
    const allBeds = await this.bedRepo.find({ where: { room: { apartment } } });

    if (allBeds.some((b) => b.status === 'AVAILABLE')) {
      apartment.bookingStatus = 'UNBOOKED';
      await this.apartmentRepo.save(apartment);
    }

    return request;
  }

  async renewRequest(requestId: string, duration: number) {
    const request = await this.rentalRequestRepo.findOne({ id: requestId });

    if (!request || request.status !== RentalStatusEnum.ACCEPTED) {
      throw new BadRequestException('Only approved requests can be renewed.');
    }

    request.duration += duration;
    return this.rentalRequestRepo.save(request);
  }

  async getAllRequests() {
    return this.rentalRequestRepo.find({
      relations: ['student', 'bed', 'bed.room', 'bed.room.apartment'],
    });
  }

  // Get all requests for a specific student
  async getRequestsForStudent(studentId: string) {
    return this.rentalRequestRepo.find({
      where: { student: { id: studentId } },
      relations: ['bed', 'bed.room', 'bed.room.apartment'],
    });
  }

  // Get all requests for a provider's apartments
  async getRequestsForProvider(providerId: string) {
    const apartments = await this.apartmentRepo.find({
      where: { provider: { id: providerId } },
      relations: ['rooms', 'rooms.beds'],
    });

    const bedIds = apartments.flatMap((apartment) =>
      apartment.rooms.flatMap((room) => room.beds.map((bed) => bed.id)),
    );

    return this.rentalRequestRepo.find({
      where: { bed: { id: In(bedIds) } },
      relations: ['student', 'bed', 'bed.room', 'bed.room.apartment'],
    });
  }
}
