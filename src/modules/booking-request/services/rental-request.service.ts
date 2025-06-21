import {
  BadRequestException,
  forwardRef,
  Inject,
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
import { NotificationService } from '@src/modules/notification/notification.service';

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
    
  
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,

  ) { }

  async createRequest(studentId: string, bedId: string, duration: number) {
    const bed = await this.bedRepo.findOne({ id: bedId }, [
      'room',
      'room.apartment',
      'room.apartment.provider'
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

    // ✅ Check if the student already requested this bed
  const existingRequest = await this.rentalRequestRepo
    .createQueryBuilder('request')
    .innerJoin('request.student', 'student')
    .innerJoin('request.bed', 'bed')
    .where('student.id = :studentId', { studentId })
    .andWhere('bed.id = :bedId', { bedId })
    .getOne();


    if (existingRequest) {
      throw new BadRequestException(
        'You have already submitted a request for this bed.',
      );
    }

    console.log(apartment.provider.userId)
    await this.notificationService.createNotification({
      userId: apartment.provider.userId,
      type: 'booking_request',
      message: `You get  a booking request for bed ${bed.id} from this student ${studentId}`,
      relatedEntityId: null,
    });

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
    await this.notificationService.createNotification({
      userId: request.student.userId,
      type: 'booking_request',
      message: `Your booking request for bed ${bed.id} was accepted`,
      relatedEntityId: requestId,
    });

    return request;
  }

  async rejectRequest(requestId: string) {
     const request = await this.rentalRequestRepo
    .createQueryBuilder('rentalRequest')
    .leftJoinAndSelect('rentalRequest.student', 'student')
    .leftJoinAndSelect('student.user', 'user')
    .leftJoinAndSelect('rentalRequest.bed', 'bed')
    .where('rentalRequest.id = :id', { id: requestId })
    .getOne();

    if (!request || request.status !== RentalStatusEnum.PENDING) {
      throw new BadRequestException('Invalid request.');
    }

    request.status = RentalStatusEnum.REJECTED;
    await this.notificationService.createNotification({
      userId: request.student.user.id,
      type: 'booking_request',
      message: `Your booking request for bed ${request.bed.id} was rejected`,
      relatedEntityId: requestId,
    });
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


async getRequestsForStudent(studentId: string) {
  // Fetch all rental requests with apartment data and whether it's favorite
  const requests = await this.rentalRequestRepo
    .createQueryBuilder('request')
    .leftJoinAndSelect('request.bed', 'bed')
    .leftJoinAndSelect('bed.room', 'room')
    .leftJoinAndSelect('room.apartment', 'apartment')

    // Join Favorite and FavoriteApartment to detect favorite apartments
    .leftJoin('Favorite', 'favorite', 'favorite.studentId = :studentId', { studentId })
    .leftJoin(
      'FavoriteApartment',
      'favoriteApartment',
      'favoriteApartment.favoriteId = favorite.id AND favoriteApartment.apartmentId = apartment.id'
    )
    .addSelect('CASE WHEN favoriteApartment.id IS NOT NULL THEN TRUE ELSE FALSE END', 'isFavorite')

    // Filter requests by student
    .where('request.studentId = :studentId', { studentId })

    .getRawAndEntities();

 const results = requests.entities.map((req, idx) => {
  const apartment = req.bed.room.apartment;

  // Clean nested apartment from room and bed
  const cleanedRoom = {
    ...req.bed.room,
    apartment: undefined, // remove nested apartment
    beds: req.bed.room.beds?.map(b => ({
      ...b,
      room: undefined, // remove nested room in bed
    })) ?? [ 
      {
        ...req.bed,
        room: undefined,
      },
    ],
  };

  return {
    id: req.id,
    duration: req.duration,
    status: req.status,
    // add other request fields if needed
    apartment: {
      ...apartment,
      isFavorite: requests.raw[idx].isFavorite,
      rooms: [cleanedRoom],
    },
  };
});
return results;

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




  // Get one request for a provider's apartments
  async getRequestById(requestId: string) {
    const apartments = await this.apartmentRepo.find({
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
      'apartment.provider'
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

    await this.notificationService.createNotification({
      userId: room.apartment.provider.userId,
      type: 'booking_request',
      message: `You get a booking request for room ${room.id} from this student ${studentId}`,
      relatedEntityId: null,
    });
    // Add this before creating the room rental request
    const existingRequest = await this.roomRentalRequestRepo
      .createQueryBuilder('request')
      .innerJoin('request.student', 'student')
      .innerJoin('request.room', 'room')
      .where('student.id = :studentId', { studentId })
      .andWhere('room.id = :roomId', { roomId })
      .getOne();

    if (existingRequest) {
      throw new BadRequestException(
        'You have already submitted a request for this room.',
      );
    }

    return this.roomRentalRequestRepo.createOne({
      student,
      room,
      duration,
      totalPrice,
      status: RentalStatusEnum.PENDING,
    });
  }

  async rejectRoomRequest(requestId: string) {
    const request = await this.roomRentalRequestRepo
    .createQueryBuilder('request')
    .leftJoinAndSelect('request.student', 'student')
    .leftJoinAndSelect('student.user', 'user')
    .leftJoinAndSelect('request.room', 'room')
    .where('request.id = :requestId', { requestId })
    .getOne();

    if (!request) throw new NotFoundException();

    request.status = RentalStatusEnum.REJECTED;
    await this.notificationService.createNotification({
      userId: request.student.user.id,
      type: 'booking_request',
      message: `Your booking request for bed ${request.room.id} was rejected`,
      relatedEntityId: requestId,
    });

    return this.roomRentalRequestRepo.save(request);
  }

  async approveRoomRequest(requestId: string) {
  // Use QueryBuilder to fetch request + room + room.beds + room.apartment
  const request = await this.roomRentalRequestRepo
  .createQueryBuilder('request')
  .leftJoinAndSelect('request.room', 'room')
  .leftJoinAndSelect('room.beds', 'bed')
  .leftJoinAndSelect('room.apartment', 'apartment')
  .leftJoinAndSelect('request.student', 'student') // ✅ Add this
  .where('request.id = :id', { id: requestId })
  .getOne();


  if (!request) {
    throw new NotFoundException('Request not found');
  }

  const anyBedReserved = request.room.beds.some(
    (bed) => bed.status !== 'AVAILABLE',
  );

  if (anyBedReserved) {
    request.status = RentalStatusEnum.REJECTED;
    await this.notificationService.createNotification({
      userId: request.student.userId,
      type: 'booking_request',
      message: `Your booking request for bed ${request.room.id} was rejected`,
      relatedEntityId: requestId,
    });
    return this.roomRentalRequestRepo.save(request);
  }

  request.status = RentalStatusEnum.ACCEPTED;

  // Reject all other bed requests for this room
  const subQuery = this.bedRepo
    .createQueryBuilder('bed')
    .select('bed.id')
    .where('bed.roomId = :roomId')
    .getQuery();

  await this.rentalRequestRepo
    .createQueryBuilder()
    .update()
    .set({ status: RentalStatusEnum.REJECTED })
    .where(`bedId IN (${subQuery})`)
    .setParameters({ roomId: request.room.id })
    .execute();

  // Update room status
  request.room.status = 'BOOKED';
  await this.roomRepo.save(request.room);

  // Update bed statuses
  const beds = await this.bedRepo
    .createQueryBuilder('bed')
    .leftJoin('bed.room', 'room')
    .where('room.id = :roomId', { roomId: request.room.id })
    .getMany();

  for (const bed of beds) {
    bed.status = 'RESERVED';
  }

  await this.bedRepo.save(beds);

  // Update apartment status if all its beds are reserved
  const apartment = await this.apartmentRepo
    .createQueryBuilder('apartment')
    .leftJoinAndSelect('apartment.rooms', 'room')
    .leftJoinAndSelect('room.beds', 'bed')
    .where('apartment.id = :apartmentId', { apartmentId: request.room.apartment.id })
    .getOne();

  if (apartment) {
    const allBedsReserved = apartment.rooms.every(room =>
      room.beds.every(bed => bed.status === 'RESERVED')
    );

    if (allBedsReserved) {
      apartment.status = 'BOOKED';
      await this.apartmentRepo.save(apartment);
    }
  }
  await this.notificationService.createNotification({
      userId: request.student.userId,
      type: 'booking_request',
      message: `Your booking request for room ${request.room.id} was accepted`,
      relatedEntityId: requestId,
    });

  return await this.roomRentalRequestRepo.save(request);
}











async getRoomRequestsForStudent(studentId: string) {
  // Fetch all rental requests with apartment data and whether it's favorite
  const requests = await this.roomRentalRequestRepo
    .createQueryBuilder('request')
    .leftJoinAndSelect('request.room', 'room')
    .leftJoinAndSelect('room.beds', 'beds')
    .leftJoinAndSelect('room.apartment', 'apartment')

    // Join Favorite and FavoriteApartment to detect favorite apartments
    .leftJoin('Favorite', 'favorite', 'favorite.studentId = :studentId', { studentId })
    .leftJoin(
      'FavoriteApartment',
      'favoriteApartment',
      'favoriteApartment.favoriteId = favorite.id AND favoriteApartment.apartmentId = apartment.id'
    )
    .addSelect('CASE WHEN favoriteApartment.id IS NOT NULL THEN TRUE ELSE FALSE END', 'isFavorite')

    // Filter requests by student
    .where('request.studentId = :studentId', { studentId })

    .getRawAndEntities();

 const results = requests.entities.map((req, idx) => {
  const apartment = req.room.apartment;

  // Clean nested apartment from room and bed
  const cleanedRoom = {
    ...req.room,
    apartment: undefined, // remove nested apartment
    beds: req.room.beds?.map(b => ({
      ...b,
      room: undefined, // remove nested room in bed
    })) ?? [ 
      {
        ...req.room,
        room: undefined,
      },
    ],
  };

  return {
    id: req.id,
    duration: req.duration,
    status: req.status,
    // add other request fields if needed
    apartment: {
      ...apartment,
      isFavorite: requests.raw[idx].isFavorite,
      rooms: [cleanedRoom],
    },
  };
});
return results;

}

async getRoomRequestsForProvider(providerId: string) {
  // Step 1: Get all apartments (with rooms and beds) owned by the provider
  const apartments = await this.apartmentRepo.find({
    where: { provider: { id: providerId } },
    relations: ['rooms', 'rooms.beds'],
  });

  // Step 2: Map room.id (as string) to room + its apartment
  const roomMap = new Map<string, { room: any; apartment: any }>();

  for (const apartment of apartments) {
    for (const room of apartment.rooms) {
      roomMap.set(room.id.toString(), {
        room: { ...room, beds: room.beds },
        apartment: { ...apartment, rooms: undefined }, // remove circular nesting
      });
    }
  }

  // Step 3: Fetch all room rental requests for rooms owned by the provider
  const requests = await this.roomRentalRequestRepo.find({
    where: {
      room: {
        id: In(Array.from(roomMap.keys())),
      },
    },
    relations: ['room' , 'student'],
  });

  // Step 4: Shape the result structure per request
  const result = requests.map((request) => {
    const { room, apartment } = roomMap.get(request.room.id.toString());
    return {
      id: request.id,
      status: request.status,
      duration: request.duration,
      startDate: request.startDate,
      endDate: request.endDate,
      student: request.student,
      apartment: {
        ...apartment,
        room: {
          ...room,
        },
      },
    };
  });

  return result;
}




async getAllRoomRequests(){
  const apartments = await this.apartmentRepo.find({
    relations: ['rooms', 'rooms.beds'],
  });

  // Step 2: Map room.id (as string) to room + its apartment
  const roomMap = new Map<string, { room: any; apartment: any }>();

  for (const apartment of apartments) {
    for (const room of apartment.rooms) {
      roomMap.set(room.id.toString(), {
        room: { ...room, beds: room.beds },
        apartment: { ...apartment, rooms: undefined }, // remove circular nesting
      });
    }
  }

  // Step 3: Fetch all room rental requests for rooms owned by the provider
  const requests = await this.roomRentalRequestRepo.find({
    where: {
      room: {
        id: In(Array.from(roomMap.keys())),
      },
    },
    relations: ['room' , 'student'],
  });

  // Step 4: Shape the result structure per request
  const result = requests.map((request) => {
    const { room, apartment } = roomMap.get(request.room.id.toString());
    return {
      id: request.id,
      status: request.status,
      duration: request.duration,
      startDate: request.startDate,
      endDate: request.endDate,
      student: request.student,
      apartment: {
        ...apartment,
        room: {
          ...room,
        },
      },
    };
  });

  return result;

}


async getRoomRequest(id:string){
  const apartments = await this.apartmentRepo.find({
    relations: ['rooms', 'rooms.beds'],
  });

  // Step 2: Map room.id (as string) to room + its apartment
  const roomMap = new Map<string, { room: any; apartment: any }>();

  for (const apartment of apartments) {
    for (const room of apartment.rooms) {
      roomMap.set(room.id.toString(), {
        room: { ...room, beds: room.beds },
        apartment: { ...apartment, rooms: undefined }, // remove circular nesting
      });
    }
  }

  // Step 3: Fetch all room rental requests for rooms owned by the provider
  const requests = await this.roomRentalRequestRepo.find({
    where: {
      id:id, 
      room: {
        id: In(Array.from(roomMap.keys())),
      },
    },
    relations: ['room' , 'student'],
  });

  // Step 4: Shape the result structure per request
  const result = requests.map((request) => {
    const { room, apartment } = roomMap.get(request.room.id.toString());
    return {
      id: request.id,
      status: request.status,
      duration: request.duration,
      startDate: request.startDate,
      endDate: request.endDate,
      student: request.student,
      apartment: {
        ...apartment,
        room: {
          ...room,
        },
      },
    };
  });

  return result;

}
}