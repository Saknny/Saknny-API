import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PendingRequest } from './entities/pendingRequest.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '@src/libs/types/base-repository';
import { EntityType } from './entities/enum/entityType.enum';
import { ImageApproval } from './entities/imageApproval.entity';
import { Type } from './entities/enum/type.enum';
import { Provider } from '../provider/entities/provider.entity';
import { ImageApprovalDto } from './dto/image-approval.dto';
import { RequestDto } from './dto/Request.dto';
import { Status } from './entities/enum/status.enum';
import { ItemType } from './entities/enum/itemType.enum';
import { ApartmentService } from '../apartment/apartment.service';
import { RoomService } from '../room/room.service';
import { BedService } from '../bed/bed.service';
import { StudentService } from '../student/student.service';
import { ProviderService } from '../provider/provider.service';
import { ImageService } from '../image/image.service';
import { CreateApartmentDto } from '../apartment/dto/create-apartment.dto/create-apartment.dto';
import { RequestItem } from "./entities/requestItem.entity";
import { CreateRoomDto } from '../room/dto/create-room.dto/create-room.dto';
import { CreateBedDto } from '../bed/dto/create-bed.dto/create-bed.dto';
import { UpdateApartmentDto } from '../apartment/dto/update-apartment.dto/update-apartment.dto';
import { ProfileCompleteEnum } from '../user/enums/profile-complete.enum';
import { UserService } from '../user/user.service';
import { NotificationService } from '../notification/notification.service';
import { Student } from '../student/entities/student.entity';

@Injectable()
export class PendingRequestService {
  constructor(
    @InjectRepository(PendingRequest)
    private readonly pendingRequestRepo: BaseRepository<PendingRequest>,

    @InjectRepository(Provider)
    private readonly providerRepo: BaseRepository<Provider>,
    @InjectRepository(ImageApproval)
    private readonly imagesRepo: BaseRepository<ImageApproval>,

    @InjectRepository(RequestItem)
    private readonly requestItemRepo: BaseRepository<RequestItem>,

     @InjectRepository(Student)
    private readonly studentRepo: BaseRepository<Student>,

    @Inject(forwardRef(() => ApartmentService))
    private readonly apartmentService: ApartmentService,

    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService,

    @Inject(forwardRef(() => BedService))
    private readonly bedService: BedService,

    @Inject(forwardRef(() => ImageService))
    private readonly imageService: ImageService,

    @Inject(forwardRef(() => ProviderService))
    private readonly providerService: ProviderService,

    @Inject(forwardRef(() => StudentService))
    private readonly studentService: StudentService,
    
@Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => NotificationService))
        private readonly notificationService: NotificationService,
  ) { }

  async updateRequestApproval(body: RequestDto) {
    const request = await this.pendingRequestRepo
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.items', 'items')
      .leftJoinAndSelect('items.request', 'requestItemRequest')
      .where('request.id = :id', { id: body.id })
      .getOne();

    request.status = body.status;
    request.reason = body.reason;

    await this.pendingRequestRepo.save(request);

    if (request.status == Status.REJECTED) {
      return;
    }

    switch (request.type) {
      case Type.CREATE_APARTMENT:
        await this.ApproveCreateApartmentRequest(body);
        break;
      case Type.UPDATE_APARTMENT:
        this.ApproveUpdateApartmentRequest(body);
        break;
      case Type.PROFILE_COMPLETE:
        await this.ApproveProfileRequest(body);
        break;
      case Type.PROFILE_UPDATE:
        await this.ApproveCardRequest(body);
        break;
    }
    await this.notificationService.createNotification({
      userId: request.userId,
      type: request.type,
      message: `Your ${request.type} has been ${request.status} by admin`,
    });
  }

  async ApproveUpdateApartmentRequest(body: RequestDto) {
    const request = await this.pendingRequestRepo
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.items', 'items')
      .leftJoinAndSelect('items.request', 'requestItemRequest')
      .where('request.id = :id', { id: body.id })
      .getOne();

    const items = request.items.filter(
      (item) => item.status === Status.APPROVED,
    );

    let rooms = items.filter(
      (item) =>
        item.type === Type.CREATE_ROOM && item.status == Status.APPROVED,
    );

    await Promise.all(
      rooms.map(async (item) => {
        const room = await this.approveRoom(item, request.referenceId);
        const itemId = item.id.replace(/-/g, '').toUpperCase().trim();
        const beds = items.filter(
          (bed) =>
            bed.entityType === EntityType.BED &&
            bed.roomRecordId == itemId &&
            bed.status === Status.APPROVED,
        );
        console.log(beds);
        await Promise.all(beds.map((bed) => this.approveBed(bed, room.id)));
      }),
    );

    rooms = items.filter(
      (item) =>
        item.type === Type.UPDATE_ROOM && item.status == Status.APPROVED,
    );

    await Promise.all(
      rooms.map(async (item) => {
        await this.UploadImage(item, item.entityId);
        const itemId = item.id.replace(/-/g, '').toUpperCase().trim();
        const beds = items.filter(
          (bed) =>
            bed.entityType === EntityType.BED &&
            bed.roomRecordId == itemId &&
            bed.status === Status.APPROVED,
        );
        await Promise.all(
          beds.map((bed) => this.approveBed(bed, item.entityId)),
        );
      }),
    );

    const beds = items.filter(
      (item) => item.type === Type.UPDATE_BED && item.status == Status.APPROVED,
    );
    await Promise.all(
      beds.map(async (bed) => await this.UploadImage(bed, bed.entityId)),
    );
  }

  async ApproveCreateApartmentRequest(body: RequestDto) {
    const request = await this.pendingRequestRepo
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.items', 'items')
      .leftJoinAndSelect('items.request', 'requestItemRequest')
      .where('request.id = :id', { id: body.id })
      .getOne();

    const items = request.items.filter(
      (item) => item.status === Status.APPROVED,
    );
    // console.log(items);
    const apartmentItem = items.filter(
      (item) =>
        item.entityType === EntityType.APARTMENT &&
        item.status == Status.APPROVED,
    )[0];
    const apartment = await this.approveApartment(apartmentItem);

    const rooms = items.filter(
      (item) =>
        item.entityType === EntityType.ROOM && item.status == Status.APPROVED,
    );

    await Promise.all(
      rooms.map(async (item) => {
        const room = await this.approveRoom(item, apartment.id);
        const itemId = item.id.replace(/-/g, '').toUpperCase().trim();
        const beds = items.filter(
          (bed) =>
            bed.entityType === EntityType.BED &&
            bed.roomRecordId == itemId &&
            bed.status === Status.APPROVED,
        );
        await Promise.all(beds.map((bed) => this.approveBed(bed, room.id)));
      }),
    );
  }

  async updateImageApproval(id: string, body: ImageApprovalDto) {
    const imageApproval = await this.imagesRepo.findOne({ id });
    if (!imageApproval) {
      throw new NotFoundException('record not found');
    }
    Object.assign(imageApproval, body);
    return await this.imagesRepo.save(imageApproval);
  }

  async getPendingRequests() {
    const requests = await this.pendingRequestRepo
    .createQueryBuilder('request')
    .leftJoinAndSelect('request.items', 'items')
    .leftJoinAndSelect('items.request', 'requestItemRequest')
    .leftJoinAndSelect('items.images', 'images')
    .leftJoinAndSelect('request.sentByProvider', 'provider')
    .leftJoinAndSelect('provider.user', 'providerUser')
    .leftJoinAndSelect('request.sentByStudent', 'student')
    .leftJoinAndSelect('student.user', 'studentUser')
    .where('request.status = :status', { status: Status.PENDING })
    .getMany();

    const baseUrl = 'http://45.88.223.182:4000';
    const uploadPath = '/uploads';
    for (const request of requests) {
    // ✅ Fix image URLs
    for (const item of request.items) {
      if (item.images) {
        item.images = item.images.map(img => ({
          ...img,
          url: `${baseUrl}${uploadPath}/${item.entityType}/${img.url}`,
        }));
      }
    }

    // ✅ Get user profile manually (like in getRequest)
    if (request.referenceType === EntityType.STUDENT) {
      const fullStudent = await this.studentRepo
        .createQueryBuilder('student')
        .leftJoinAndSelect('student.user', 'user')
        .where('user.id = :id', { id: request.userId })
        .getOne();

      request['fullProfile'] = fullStudent;

      if (fullStudent?.user) {
        request['user'] = {
          email: fullStudent.user.verifiedEmail || fullStudent.user.unVerifiedEmail,
        };
      }
    } else if (request.referenceType === EntityType.PROVIDER) {
      const fullProvider = await this.providerRepo
        .createQueryBuilder('provider')
        .leftJoinAndSelect('provider.user', 'user')
        .where('user.id = :id', { id: request.userId })
        .getOne();

      request['fullProfile'] = fullProvider;

      if (fullProvider?.user) {
        request['user'] = {
          email: fullProvider.user.verifiedEmail || fullProvider.user.unVerifiedEmail,
        };
      }
    }
  }

  return requests;
}

  async getRequest(id: string) {
  const request = await this.pendingRequestRepo
    .createQueryBuilder('request')
    .leftJoinAndSelect('request.items', 'items')
    .leftJoinAndSelect('items.request', 'requestItemRequest')
    .leftJoinAndSelect('items.images', 'images')
    .where('request.id = :id', { id })
    .getOne();

  const baseUrl = 'http://45.88.223.182:4000';
  const uploadPath = '/uploads';

  if (!request) {
    throw new NotFoundException('Request not found');
  }

  // ✅ Fix image URLs
  if (request?.items) {
    for (const item of request.items) {
      if (item.images) {
        item.images = item.images.map(img => ({
          ...img,
          url: `${baseUrl}${uploadPath}/${item.entityType}/${img.url}`,
        }));
      }
    }
  }

  // ✅ Include full profile and user if request is PROFILE_UPDATE or COMPLETE_PROFILE
  if (
    request.type === Type.PROFILE_UPDATE ||
    request.type === Type.PROFILE_COMPLETE
  ) {
    if (request.referenceType === EntityType.STUDENT) {
      const fullStudent = await this.studentRepo
        .createQueryBuilder('student')
        .leftJoinAndSelect('student.user', 'user')
        .where('user.id = :id', { id: request.userId })
        .getOne();

      request['fullProfile'] = fullStudent;

      if (fullStudent?.user) {
        request['user'] = {
          email: fullStudent.user.verifiedEmail || fullStudent.user.unVerifiedEmail,
        };
      }
    } else if (request.referenceType === EntityType.PROVIDER) {
      const fullProvider = await this.providerRepo
        .createQueryBuilder('provider')
        .leftJoinAndSelect('provider.user', 'user')
        .where('user.id = :id', { id: request.userId })
        .getOne();

      request['fullProfile'] = fullProvider;

      if (fullProvider?.user) {
        request['user'] = {
          email: fullProvider.user.verifiedEmail || fullProvider.user.unVerifiedEmail,
        };
      }
    }
  }

  return request;
}



  async getItem(id: string) {
    const item = await this.requestItemRepo
      .createQueryBuilder('item')
      .where('item.id = :id', { id })
      .leftJoinAndSelect('item.images', 'images')
      .getOne();

    const baseUrl = 'http://45.88.223.182:4000';
    const uploadPath = '/uploads';

    if (item.images) {
      item.images = item.images.map(img => ({
        ...img,
        url: `${baseUrl}${uploadPath}/${item.entityType}/${img.url}`
      }));
    }
    return item;
  }

  async CreateProfileRequest(
    userId: string,
    entityType: EntityType,
    profileData: any,
    requestType: Type,
  ) {
    const formattedData = {
      gender: profileData?.gender ?? null,
      phone: profileData?.phone ?? null,
      instagram: profileData?.instagram ?? null,
      facebook: profileData?.facebook ?? null,
      linkedin: profileData?.linkedin ?? null,
      image: profileData?.image ?? null,
      idCard: profileData?.idCard ?? null,
      hobbies: profileData?.hobbies ?? null,
      socialPerson: profileData?.socialPerson ?? null,
      level: profileData?.level ?? null,
      university: profileData?.university ?? null,
      smoking: profileData?.smoking ?? null,
      major: profileData?.major ?? null,
      lastName: profileData?.lastName ?? null,
      firstName: profileData?.firstName ?? null,
      bio: profileData?.bio ?? null,
    };

    let request = await this.pendingRequestRepo
      .createQueryBuilder('pendingRequest')
      .where('pendingRequest.type = :type', { type: requestType })
      .andWhere('pendingRequest.status = :status', { status: Status.PENDING })
      .andWhere('pendingRequest.userId = :userId', { userId })
      .getOne();

    if (request) {
      await this.requestItemRepo
        .createQueryBuilder()
        .delete()
        .where('requestId = :requestId', { requestId: request.id })
        .execute();

      await this.pendingRequestRepo
        .createQueryBuilder()
        .delete()
        .where('id = :requestId', { requestId: request.id })
        .execute();
    }

    request = this.pendingRequestRepo.create({
      userId: userId,
      type: requestType,
      referenceType: entityType,
    });

    await this.pendingRequestRepo.save(request);

    const requestItem = this.requestItemRepo.create({
      data: formattedData,
      request,
      entityType,
    });
    await this.requestItemRepo.save(requestItem);

    return { message: 'Profile update submitted for approval' };
  }

  async UpdateCardRequest(
    userId: string,
    idCard: string,
    entityType: EntityType,
  ) {
    let request = await this.pendingRequestRepo
      .createQueryBuilder('pendingRequest')
      .where('pendingRequest.type = :type', { type: Type.PROFILE_UPDATE })
      .andWhere('pendingRequest.status = :status', { status: Status.PENDING })
      .andWhere('pendingRequest.userId = :userId', { userId })
      .getOne();

    if (request) {
      await this.requestItemRepo
        .createQueryBuilder()
        .delete()
        .where('requestId = :requestId', { requestId: request.id })
        .execute();

      await this.pendingRequestRepo
        .createQueryBuilder()
        .delete()
        .where('id = :requestId', { requestId: request.id })
        .execute();
    }

    request = this.pendingRequestRepo.create({
      userId: userId,
      type: Type.PROFILE_UPDATE,
      referenceType: entityType,
    });

    await this.pendingRequestRepo.save(request);

    const requestItem = this.requestItemRepo.create({
      data: {
        idCard,
      },
      request,
      entityType,
    });
    await this.requestItemRepo.save(requestItem);

 
  }

  async ApproveProfileRequest(body: RequestDto) {
    const request = await this.pendingRequestRepo
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.items', 'items')
      .leftJoinAndSelect('items.request', 'requestItemRequest')
      .where('request.id = :id', { id: body.id })
      .getOne();

      
    const item = request.items[0];
    if (body.status === Status.REJECTED) {
    await this.userService.updateProfileCompleteStatus(
      request.userId,
      ProfileCompleteEnum.UNVERIFIED
    );
    return; // Exit early
  }
    switch (item.entityType) {
      case EntityType.PROVIDER:
        await this.providerService.updateProfile(request.userId, item.data);
        break;
      case EntityType.STUDENT:
        await this.studentService.completeProfile(request.userId, item.data);
        break;
    }
    // 3. Update user's profileComplete status to VERIFIED
    await this.userService.updateProfileCompleteStatus(
      request.userId,
      ProfileCompleteEnum.VERIFIED
    );
  }

  async ApproveCardRequest(body: RequestDto) {
    const request = await this.pendingRequestRepo
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.items', 'items')
      .leftJoinAndSelect('items.request', 'requestItemRequest')
      .where('request.id = :id', { id: body.id })
      .getOne();

    const item = request.items[0];

    switch (item.entityType) {
      case EntityType.PROVIDER:
        await this.providerService.updateCard(request.userId, item.data);
        break;
      case EntityType.STUDENT:
        await this.studentService.updateCard(request.userId, item.data);
        break;
    }
  }

  async createApartmentRequest(
    userId: string,
    createApartmentDto: CreateApartmentDto,
  ): Promise<{ requestId: string; requestItemId: string }> {
    const pendingRequest = this.pendingRequestRepo.create({
      userId,
      referenceType: EntityType.APARTMENT,
      status: Status.PENDING,
      type: Type.CREATE_APARTMENT,
      description: 'Provider is requesting to create a new apartment.',
    });

    await this.pendingRequestRepo.save(pendingRequest);

    const requestItem = this.requestItemRepo.create({
      status: Status.PENDING,
      entityType: EntityType.APARTMENT,
      data: createApartmentDto,
      request: pendingRequest,
    });

    await this.requestItemRepo.save(requestItem);

    return { requestId: pendingRequest.id, requestItemId: requestItem.id };
  }

  async updateApartmentRequest(
    apartmentId: string,
    userId: string,
  ): Promise<{ requestId: string }> {
    const existingRequest = await this.pendingRequestRepo
      .createQueryBuilder('request')
      .where('request.referenceId = :apartmentId', { apartmentId })
      .andWhere('request.type = :type', { type: Type.UPDATE_APARTMENT })
      .andWhere('request.status = :status', { status: Status.PENDING })
      .getOne();

    if (existingRequest) {
      const requestItems = await this.requestItemRepo
        .createQueryBuilder('item')
        .where('item.requestId = :requestId', { requestId: existingRequest.id })
        .select('item.id')
        .getMany();

      const requestItemIds = requestItems.map((item) => item.id);

      if (requestItemIds.length > 0) {
        await this.imagesRepo
          .createQueryBuilder()
          .delete()
          .where('itemId IN (:...requestItemIds)', { requestItemIds })
          .execute();

        await this.requestItemRepo
          .createQueryBuilder()
          .delete()
          .where('id IN (:...requestItemIds)', { requestItemIds })
          .execute();
      }

      await this.pendingRequestRepo
        .createQueryBuilder()
        .delete()
        .where('id = :requestId', { requestId: existingRequest.id })
        .execute();
    }

    const pendingRequest = this.pendingRequestRepo.create({
      referenceId: apartmentId,
      referenceType: EntityType.APARTMENT,
      status: Status.PENDING,
      userId,
      type: Type.UPDATE_APARTMENT,
      description: 'Provider is requesting to update an apartment.',
    });

    await this.pendingRequestRepo.save(pendingRequest);
    return { requestId: pendingRequest.id };
  }

  async addRoomRequest(
    requestId: string,
    createRoomtDto: CreateRoomDto,
  ): Promise<{ requestId: string; requestItemId: string }> {
    const request = await this.pendingRequestRepo.findOne({ id: requestId });

    const requestItem = this.requestItemRepo.create({
      status: Status.PENDING,
      entityType: EntityType.ROOM,
      data: createRoomtDto,
      request: request,
      type: Type.CREATE_ROOM,
    });

    await this.requestItemRepo.save(requestItem);

    return { requestId: request.id, requestItemId: requestItem.id };
  }

  async addBedRequest(
    requestId: string,
    roomRecordId: string,
    createBedDto: CreateBedDto,
  ): Promise<{ requestId: string; requestItemId: string }> {
    const request = await this.pendingRequestRepo.findOne({ id: requestId });

    const requestItem = this.requestItemRepo.create({
      status: Status.PENDING,
      entityType: EntityType.BED,
      roomRecordId,
      data: createBedDto,
      request: request,
      type: Type.CREATE_BED,
    });

    await this.requestItemRepo.save(requestItem);

    return { requestId: request.id, requestItemId: requestItem.id };
  }
  async UploadImagesRequest(
    requestItemId: string,
    imageFilenames: string[] | string,
  ) {
    const filenamesArray = Array.isArray(imageFilenames)
      ? imageFilenames
      : [imageFilenames];

    const item = await this.requestItemRepo.findOne({ id: requestItemId });

    if (!item) {
      throw new NotFoundException(`RequestItem not found`);
    }

    const images = filenamesArray.map((filename) =>
      this.imagesRepo.create({
        url: filename,
        Item: item,
      }),
    );
    const savedImages = await this.imagesRepo.save(images);

    await this.requestItemRepo.save(item);
    return savedImages.map((image) => image.id);

  }

  async UploadDocRequest(requestId: string, document: string) {
    const item = await this.requestItemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.request', 'request')
      .where('item.requestId = :requestId', { requestId })
      .getOne();

    item.document = document;
    await this.requestItemRepo.save(item);
  }

  async updateItemApproval(body: RequestDto) {
    const item = await this.requestItemRepo.findOne({ id: body.id });
    item.status = body.status;
    item.reason = body.reason;
    await this.requestItemRepo.save(item);
  }

  async updateRoomRequest(roomId: string, requestId: string) {
    const request = await this.pendingRequestRepo.findOne({ id: requestId });

    const requestItem = this.requestItemRepo.create({
      status: Status.PENDING,
      entityType: EntityType.ROOM,
      entityId: roomId,
      request: request,
      type: Type.UPDATE_ROOM,
    });

    await this.requestItemRepo.save(requestItem);

    return { requestId: request.id, requestItemId: requestItem.id };
  }

  async updateBedRequest(bedId: string, requestId: string) {
    const request = await this.pendingRequestRepo.findOne({ id: requestId });

    const requestItem = this.requestItemRepo.create({
      status: Status.PENDING,
      entityType: EntityType.BED,
      entityId: bedId,
      request: request,
      type: Type.UPDATE_BED,
    });

    await this.requestItemRepo.save(requestItem);

    return { requestId: request.id, requestItemId: requestItem.id };
  }

  async approveApartment(item: RequestItem) {
    const request = await this.pendingRequestRepo.findOne({
      id: item.request.id,
    });

    const apartment = await this.apartmentService.createApartment(
      request.userId,
      item.data,
    );

    await this.UploadImage(item, apartment.id);
    await this.apartmentService.uploadDocuments(apartment.id, item.document);

    return apartment;
  }

  async approveBed(item: RequestItem, roomId: string) {
    const bed = await this.bedService.createBed(roomId, item.data);
    await this.UploadImage(item, bed.id);
  }

  async approveRoom(item: RequestItem, apartmentId: string) {
    const room = await this.roomService.createRoom(apartmentId, item.data);
    await this.UploadImage(item, room.id);
    return room;
  }

  async UploadImage(item: RequestItem, entityId: string) {
    const images = await this.imagesRepo
      .createQueryBuilder('image')
      .leftJoinAndSelect('image.Item', 'item')
      .where('item.id = :itemId', { itemId: item.id })
      .andWhere('image.status = :status', { status: Status.APPROVED })
      .getMany();
    await this.imageService.uploadImages(
      entityId,
      item.entityType,
      images.map((image) => image.url),
    );
  }

  async getPendingProfileRequests() {
    const requests = await this.pendingRequestRepo
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.items', 'items')
      .leftJoinAndSelect('items.request', 'requestItemRequest')
      .where('request.status = :status', { status: Status.PENDING })
      .andWhere('request.type = :type', { type: Type.PROFILE_COMPLETE })
      .getMany();
  
    const baseUrl = 'http://45.88.223.182:4000';
    const uploadPath = '/uploads';
  
    // Iterate through each request and its items
    for (const request of requests) {
      for (const item of request.items) {
        // Check if data contains an image and modify the image URL
        if (item.data && item.data.image) {
          item.data.image = baseUrl + item.data.image;
        }
      }
    }
  
    return requests;
  }

  async getPendingProfileRequestById(requestId: string) {
    const request = await this.pendingRequestRepo
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.items', 'items')
      .leftJoinAndSelect('items.request', 'requestItemRequest')
      .where('request.id = :requestId', { requestId })
      .andWhere('request.status = :status', { status: Status.PENDING })
      .andWhere('request.type = :type', { type: Type.PROFILE_COMPLETE })
      .getOne();
  
    if (!request) {
      throw new NotFoundException(`Request with ID ${requestId} not found`);
    }
  
    const baseUrl = 'http://45.88.223.182:4000';
    const uploadPath = '/uploads';
  
    for (const item of request.items) {
      if (item.data && item.data.image) {
        item.data.image = baseUrl + item.data.image;
      }
    }
  
    return request;
  }
  
  
  
  
}
