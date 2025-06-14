import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectBaseRepository } from '@src/libs/decorators/inject-base-repository.decorator';
import { RentalRequest } from '../entity/rental-request.entity';
import { BaseRepository } from '@src/libs/types/base-repository';
import { Bed } from '@src/modules/bed/entities/bed.entity/bed.entity';
import { Apartment } from '@src/modules/apartment/entities/apartment.entity/apartment.entity';
import { Student } from '@src/modules/student/entities/student.entity';
import { Room } from '@src/modules/room/entities/room.entity/room.entity';
import { RentalStatusEnum } from '../enums/rental-status.enum';
import { In } from 'typeorm';
import { RoomRentalRequest } from '../entity/room-rental-request.entity';
import { PaginatorInput } from '@src/libs/application/paginator/paginator.input';
import { FavoriteApartment } from '@src/modules/favoriteList/entities/favorite-apartment.entity';

@Injectable()
export class RentalRequestService {
  constructor(
    @InjectBaseRepository(RentalRequest)
    private readonly rentalRequestRepo: BaseRepository<RentalRequest>,

    @InjectBaseRepository(RoomRentalRequest)
    private readonly roomRentalRequestRepo: BaseRepository<RoomRentalRequest>,

    @InjectBaseRepository(Bed)
    private readonly bedRepo: BaseRepository<Bed>,

    @InjectBaseRepository(Apartment)
    private readonly apartmentRepo: BaseRepository<Apartment>,

    @InjectBaseRepository(Student)
    private readonly studentRepo: BaseRepository<Student>,

    @InjectBaseRepository(Room)
    private readonly roomRepo: BaseRepository<Room>,
    @InjectBaseRepository(FavoriteApartment)
    private readonly favoriteApartmentRepository: BaseRepository<FavoriteApartment>,

  ) { }

  async createRequest(studentId: string, bedId: string, duration: number) {
    const bed = await this.bedRepo.findOne({ id: bedId }, [
      'room',
      'room.apartment',
    ]);

    if (!bed || bed.status !== 'AVAILABLE') {
      throw new BadRequestException('Bed is not available.');
    }

    const apartment = bed.room.apartment;
    const student = await this.studentRepo.findOne({ id: studentId });

    if (!student) throw new BadRequestException('Student not found.');

    // Check gender compatibility
    if (apartment.gender && apartment.gender !== student.gender) {
      throw new BadRequestException(
        'Apartment gender restriction does not match student.',
      );
    }

    return await this.rentalRequestRepo.createOne({
      student,
      bed,
      price: bed.price,
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
    const room = bed.room;
    const apartment = bed.room.apartment;

    // If first approval and gender is not set, set it
    if (!apartment.gender) {
      apartment.gender = request.student.gender;
      await this.apartmentRepo.save(apartment);
    }

    // ✅ Update ROOM status
    const roomBeds = await this.bedRepo.find({
      where: { room: { id: room.id } },
    });

    const allReserved = roomBeds.every((b) => b.status === 'RESERVED');
    const someReserved = roomBeds.some((b) => b.status === 'RESERVED');

    if (allReserved) {
      room.status = 'BOOKED';
    } else if (someReserved) {
      room.status = 'PARTIALLY_BOOKED';
    }

    await this.roomRepo.save(room);
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
    const room = bed.room;
    bed.status = 'AVAILABLE';
    bed.student = null;
    await this.bedRepo.save(bed);

    //  Update ROOM status
    const roomBeds = await this.bedRepo.find({
      where: { room: { id: room.id } },
    });

    const roomAllAvailable = roomBeds.every((b) => b.status === 'AVAILABLE');
    const roomSomeReserved = roomBeds.some((b) => b.status === 'RESERVED');

    if (roomAllAvailable) {
      room.status = 'UNBOOKED';
    } else if (roomSomeReserved) {
      room.status = 'PARTIALLY_BOOKED';
    } else {
      room.status = 'BOOKED';
    }

    await this.roomRepo.save(room);
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
  // Get one request for a provider's apartments
  async getRequestForProviderById(providerId: string, requestId: string) {
    const apartments = await this.apartmentRepo.find({
      where: { provider: { id: providerId } },
      relations: ['rooms', 'rooms.beds'],
    });

    const bedIds = apartments.flatMap((apartment) =>
      apartment.rooms.flatMap((room) => room.beds.map((bed) => bed.id)),
    );

    const request = await this.rentalRequestRepo
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.student', 'student')
      .leftJoinAndSelect('request.bed', 'bed')
      .leftJoinAndSelect('bed.room', 'room')
      .leftJoinAndSelect('room.apartment', 'apartment')
      .where('request.id = :requestId', { requestId })
      .andWhere('bed.id IN (:...bedIds)', { bedIds })
      .getOne();

    if (!request) {
      throw new NotFoundException(
        'Request not found or does not belong to this provider',
      );
    }

    return request;
  }

  // ******************* Rooms ******************* //

  async createRoomRequest(studentId: string, roomId: string, duration: number) {
    const student = await this.studentRepo.findOne({ id: studentId });

    const room = await this.roomRepo.findOne({ id: roomId }, [
      'beds',
      'apartment',
    ]);

    if (!student || !room) throw new NotFoundException();

    const unavailableBed = room.beds.find((bed) => bed.status !== 'AVAILABLE');

    if (unavailableBed) {
      throw new BadRequestException('At least one bed is unavailable.');
    }

    // Check gender
    if (room.apartment.gender && student.gender !== room.apartment.gender) {
      throw new BadRequestException('Gender restriction mismatch.');
    }

    const totalPrice = room.beds.reduce(
      (sum, bed) => sum + Number(bed.price),
      0,
    );

    return this.roomRentalRequestRepo.createOne({
      student,
      room,
      duration,
      totalPrice,
      status: RentalStatusEnum.PENDING,
    });
  }

  async rejectRoomRequest(requestId: string) {
    const request = await this.roomRentalRequestRepo.findOne({ id: requestId });

    if (!request) throw new NotFoundException();

    request.status = RentalStatusEnum.REJECTED;

    return this.roomRentalRequestRepo.save(request);
  }

  async approveRoomRequest(requestId: string) {
    const request = await this.roomRentalRequestRepo.findOne(
      { id: requestId },
      ['room', 'room.beds', 'room.apartment'],
    );

    const anyBedReserved = request.room.beds.some(
      (bed) => bed.status !== 'AVAILABLE',
    );

    if (anyBedReserved) {
      request.status = RentalStatusEnum.REJECTED;
      return this.roomRentalRequestRepo.save(request);
    }

    request.status = RentalStatusEnum.ACCEPTED;

    // Reject all bed requests for this room
    await this.rentalRequestRepo
      .createQueryBuilder()
      .update()
      .set({ status: RentalStatusEnum.REJECTED })
      .where('bedId IN ' +
        this.roomRentalRequestRepo
          .createQueryBuilder()
          .subQuery()
          .select('bed.id')
          .from('bed', 'bed')
          .where('bed.roomId = :roomId', { roomId: request.room.id })
          .getQuery())
      .setParameters({ roomId: request.room.id })
      .execute();


    // update room status 
    request.room.status = 'BOOKED';
    await this.roomRepo.save(request.room);
    // update bed status 
    const beds = await this.bedRepo.find({
      where: { room: { id: request.room.id } },
    });

    for (const bed of beds) {
      bed.status = 'RESERVED'; // or BedStatusEnum.RESERVED
      await this.bedRepo.save(bed);
    }

    //  update apartment status

    const apartment = await this.apartmentRepo
      .createQueryBuilder('apartment')
      .leftJoinAndSelect('apartment.rooms', 'room')
      .leftJoinAndSelect('room.beds', 'bed')
      .where('apartment.id = :apartmentId', { apartmentId: request.room.apartment.id })
      .getOne();
    const allBedsReserved = apartment.rooms.every(room =>
      room.beds.every(bed => bed.status === 'RESERVED')
    );

    if (allBedsReserved) {
      apartment.status = 'BOOKED';
      await this.apartmentRepo.save(apartment);
    }


    return await this.roomRentalRequestRepo.save(request);
  }

  async getAllRoomRequests(studentId: string, paginate: PaginatorInput) {
    const [requests, count] = await this.roomRentalRequestRepo.findAndCount({
      where: { student: { id: studentId } },
      relations: ['room', 'room.apartment'],
      skip: (paginate.page - 1) * paginate.limit,
      take: paginate.limit,
    });

    return {
      data: requests,
      total: count,
      page: paginate.page,
      totalPages: Math.ceil(count / paginate.limit),
    };
  }
}
