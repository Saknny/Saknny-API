import { forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PendingRequest } from "./entities/pendingRequest.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseRepository } from "@src/libs/types/base-repository";
import { EntityType } from "./entities/enum/entityType.enum";
import { ImageApproval } from "./entities/imageApproval.entity";
import { Type } from "./entities/enum/type.enum";
import { Provider } from "../provider/entities/provider.entity";
import { ImageApprovalDto } from "./dto/image-approval.dto";
import { RequestDto } from "./dto/Request.dto";
import { Status } from "./entities/enum/status.enum";
import { ItemType } from "./entities/enum/itemType.enum";
import { ApartmentService } from "../apartment/apartment.service";
import { RoomService } from "../room/room.service";
import { BedService } from "../bed/bed.service";
import { PendingProfile } from "./entities/PendingProfile.Entity";
import { StudentService } from "../student/student.service";
import { ProviderService } from "../provider/provider.service";
import { ApartmentDocument } from "../apartment/entities/document.entity";
import { PendingDocument } from "./entities/pendingDocument.entity";
import { ImageService } from "../image/image.service";
import { CreateApartmentDto } from "../apartment/dto/create-apartment.dto/create-apartment.dto";
import { RequestItem } from "./entities/RequestItem.entity";
import { CreateRoomDto } from "../room/dto/create-room.dto/create-room.dto";
import { CreateBedDto } from "../bed/dto/create-bed.dto/create-bed.dto";
import { UpdateApartmentDto } from "../apartment/dto/update-apartment.dto/update-apartment.dto";

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
    ) { }



    async updateRequestApproval(body: RequestDto) {

        const request = await this.pendingRequestRepo
            .createQueryBuilder('request')
            .leftJoinAndSelect('request.items', 'items')
            .leftJoinAndSelect('items.request', 'requestItemRequest')
            .where('request.id = :id', { id: body.id })
            .getOne();
        request.status == body.status;
        request.reason == body.reason;
        await this.pendingRequestRepo.save(request);
        if (request.status == Status.REJECTED) {
            return;
        }

        switch (body.type) {
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
                await this.ApproveProfileRequest(body);
                break;

        }
    }

    async ApproveUpdateApartmentRequest(body: RequestDto) {

    }

    async ApproveCreateApartmentRequest(body: RequestDto) {
        const request = await this.pendingRequestRepo
            .createQueryBuilder('request')
            .leftJoinAndSelect('request.items', 'items')
            .leftJoinAndSelect('items.request', 'requestItemRequest')
            .where('request.id = :id', { id: body.id })
            .getOne();


        const items = request.items;

        const apartmentItem = items.filter(item => item.entityType === EntityType.APARTMENT && item.status == Status.APPROVED)[0];
        const apartment = await this.approveApartment(apartmentItem);

        const rooms = items.filter(item => item.entityType === EntityType.ROOM && item.status == Status.APPROVED);


        await Promise.all(rooms.map(async (item) => {
            const room = await this.approveRoom(item, apartment.id);
            const beds = items.filter(item =>
                item.entityType === EntityType.BED &&
                item.data.name.startsWith(room.name) &&
                item.status === Status.APPROVED
            );
            await Promise.all(beds.map(item => this.approveBed(item, room.id)));
        }
        ));



    }





    async updateImageApproval(id: string, body: ImageApprovalDto) {
        const imageApproval = await this.imagesRepo.findOne({ id });
        if (!imageApproval) {
            throw new NotFoundException('record not found')
        }
        Object.assign(imageApproval, body);
        return await this.imagesRepo.save(imageApproval);
    }

    async getPendingRequests() {
        return await this.pendingRequestRepo.find({ where: { status: Status.PENDING } });
    }

    async getRequestItems(id: string) {
        const items = await this.requestItemRepo
            .createQueryBuilder('item')
            .leftJoinAndSelect('item.request', 'request')
            .where('request.id = :id', { id })
            .where('item.status = :status', { status: Status.PENDING })
            .getMany();

        return items;
    }


    async CreateProfileRequest(userId: string, entityType: EntityType, profileData: any, requestType: Type) {


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
        };


        let request = await this.pendingRequestRepo
            .createQueryBuilder("pendingRequest")
            .leftJoinAndSelect("pendingRequest.pendingProfile", "pendingProfile")
            .where("pendingProfile.userId = :userId", { userId })
            .andWhere("pendingRequest.type = :type", { type: requestType })
            .andWhere("pendingRequest.status = :status", { status: Status.PENDING })
            .getOne();

        if (request) {
            await this.requestItemRepo
                .createQueryBuilder()
                .delete()
                .where("requestId = :requestId", { requestId: request.id })
                .execute();

            await this.pendingRequestRepo
                .createQueryBuilder()
                .delete()
                .where("id = :requestId", { requestId: request.id })
                .execute();
        } else {

            request = this.pendingRequestRepo.create(
                {
                    userId: userId,
                    type: requestType,
                    referenceType: entityType
                });

            await this.pendingRequestRepo.save(request);

            const requestItem = this.requestItemRepo.create(
                {
                    data: formattedData,
                    request,
                    entityType,

                });
            await this.requestItemRepo.save(requestItem);

        }

        return { message: "Profile update submitted for approval" };
    }



    async ApproveProfileRequest(body: RequestDto) {

        const request = await this.pendingRequestRepo
            .createQueryBuilder('request')
            .leftJoinAndSelect('request.items', 'items')
            .leftJoinAndSelect('items.request', 'requestItemRequest')
            .where('request.id = :id', { id: body.id })
            .getOne();


        const item = request.items[0];
        switch (request.type) {
            case Type.PROFILE_COMPLETE:
                switch (item.entityType) {
                    case EntityType.PROVIDER:
                        await this.providerService.updateProfile(request.userId, item.data);
                        break;
                    case EntityType.STUDENT:
                        await this.studentService.completeProfile(request.userId, item.data);
                        break;

                }
                break;
            case Type.PROFILE_UPDATE:
                switch (item.entityType) {
                    case EntityType.PROVIDER:
                        await this.providerService.updateProfile(request.userId, item.data);
                        break;
                    case EntityType.STUDENT:
                        await this.studentService.updateStudent(request.userId, item.data);
                        break;

                }
                break;
        }


    }


    async createApartmentRequest(
        userId: string,
        createApartmentDto: CreateApartmentDto
    ): Promise<{ requestId: string; }> {
        const { descriptionEn, descriptionAr, gender, name, roomCount } = createApartmentDto;


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
            referenceId: null,
            referenceType: EntityType.APARTMENT,
            entityName: name,
            data: {
                descriptionEn,
                descriptionAr,
                gender,
                name,
                roomCount,

            },
            request: pendingRequest,
        });

        await this.requestItemRepo.save(requestItem);

        return { requestId: pendingRequest.id }
    }


    async updateApartmentRequest(apartmentId: string,
        updateApartmentDto: UpdateApartmentDto
    ): Promise<{ requestId: string }> {

        const existingRequest = await this.pendingRequestRepo
            .createQueryBuilder("request")
            .where("request.referenceId = :apartmentId", { apartmentId })
            .andWhere("request.type = :type", { type: Type.UPDATE_APARTMENT })
            .andWhere("request.status = :status", { status: Status.PENDING })
            .getOne();

        if (existingRequest) {
            const requestItems = await this.requestItemRepo
                .createQueryBuilder("item")
                .where("item.requestId = :requestId", { requestId: existingRequest.id })
                .select("item.id")
                .getMany();

            const requestItemIds = requestItems.map(item => item.id);

            if (requestItemIds.length > 0) {
                await this.imagesRepo
                    .createQueryBuilder()
                    .delete()
                    .where("itemId IN (:...requestItemIds)", { requestItemIds })
                    .execute();

                await this.requestItemRepo
                    .createQueryBuilder()
                    .delete()
                    .where("id IN (:...requestItemIds)", { requestItemIds })
                    .execute();
            }

            await this.pendingRequestRepo
                .createQueryBuilder()
                .delete()
                .where("id = :requestId", { requestId: existingRequest.id })
                .execute();
        }
        const { descriptionEn, descriptionAr, gender } = updateApartmentDto;

        const pendingRequest = this.pendingRequestRepo.create({
            referenceId: apartmentId,
            referenceType: EntityType.APARTMENT,
            status: Status.PENDING,
            type: Type.UPDATE_APARTMENT,
            description: 'Provider is requesting to update an apartment.',
        });

        await this.pendingRequestRepo.save(pendingRequest);

        const requestItem = this.requestItemRepo.create({
            status: Status.PENDING,
            entityType: EntityType.APARTMENT,
            referenceId: null,
            referenceType: EntityType.APARTMENT,

            data: {
                descriptionEn,
                descriptionAr,
                gender,
            },
            request: pendingRequest,
        });

        await this.requestItemRepo.save(requestItem);

        return { requestId: pendingRequest.id }
    }


    async addRoomRequest(
        requestId: string,
        createRoomtDto: CreateRoomDto
    ): Promise<{ requestId: string; requestItemId: string }> {

        const request = await this.pendingRequestRepo.findOne({ id: requestId });
        const { descriptionEn, descriptionAr, name, bedCount } = createRoomtDto;

        const requestItem = this.requestItemRepo.create({
            status: Status.PENDING,
            entityType: EntityType.ROOM,
            referenceId: null,
            referenceType: EntityType.APARTMENT,
            entityName: name,
            data: {
                descriptionEn,
                descriptionAr,
                bedCount,
                name

            },
            request: request,
        });

        await this.requestItemRepo.save(requestItem);

        return { requestId: request.id, requestItemId: requestItem.id };
    }


    async addBedRequest(
        requestId: string,
        createBedDto: CreateBedDto
    ): Promise<{ requestId: string; requestItemId: string }> {

        const request = await this.pendingRequestRepo.findOne({ id: requestId });
        const { descriptionEn, descriptionAr, name, price } = createBedDto;

        const requestItem = this.requestItemRepo.create({
            status: Status.PENDING,
            entityType: EntityType.BED,
            referenceId: null,
            entityName: name,
            referenceType: EntityType.APARTMENT,

            data: {
                descriptionEn,
                descriptionAr,
                price,
                name,

            },
            request: request,
        });

        await this.requestItemRepo.save(requestItem);

        return { requestId: request.id, requestItemId: requestItem.id };
    }
    async UploadImagesRequest(requestId: string, imageFilenames: string[] | string, entityName: string) {

        const request = await this.pendingRequestRepo.findOne({ id: requestId });
        if (!request) {
            throw new NotFoundException(`Request with ID ${requestId} not found.`);
        }
        const filenamesArray = Array.isArray(imageFilenames) ? imageFilenames : [imageFilenames];

        const item = await this.requestItemRepo
            .createQueryBuilder('item')
            .leftJoinAndSelect('item.request', 'request')
            .where('item.entityName = :entityName', { entityName })
            .andWhere('item.requestId = :requestId', { requestId })
            .getOne();

        if (!item) {
            throw new NotFoundException(`RequestItem not found for request ${requestId} and entityName ${entityName}`);
        }

        const images = filenamesArray.map(filename =>
            this.imagesRepo.create({
                url: filename,
                Item: item,
            })
        );
        await this.imagesRepo.save(images);

        await this.requestItemRepo.save(item);
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



    async approveApartment(item: RequestItem) {
        const request = await this.pendingRequestRepo.findOne({ id: item.request.id });

        const apartment = await this.apartmentService.createApartment(request.userId, item.data);

        console.log(item.id);
        const images = await this.imagesRepo
            .createQueryBuilder('image')
            .leftJoinAndSelect('image.Item', 'item')
            .where('item.id = :itemId', { itemId: item.id })
            .andWhere('image.status = :status', { status: Status.APPROVED })
            .getMany();


        // console.log("RequestItem:", item);
        console.log("Images:", images.length);

        await this.imageService.uploadImages(apartment.id, EntityType.APARTMENT, images.map(image => image.url));

        await this.apartmentService.uploadDocuments(apartment.id, item.document);

        return apartment;
    }


    async approveBed(item: RequestItem, roomId: string) {
        const request = await this.pendingRequestRepo.findOne({ id: item.request.id })
        const bed = await this.bedService.createBed(roomId, item.data);
        const images = await this.imagesRepo
            .createQueryBuilder('image')
            .leftJoinAndSelect('image.Item', 'item')
            .where('item.id = :itemId', { itemId: item.id })
            .andWhere('image.status = :status', { status: Status.APPROVED })
            .getMany();
        await this.imageService.uploadImages(bed.id, EntityType.BED, images.map(image => image.url));

    }


    async approveRoom(item: RequestItem, apartmentId: string) {
        const room = await this.roomService.createRoom(apartmentId, item.data);

        const images = await this.imagesRepo
            .createQueryBuilder('image')
            .leftJoinAndSelect('image.Item', 'item')
            .where('item.id = :itemId', { itemId: item.id })
            .andWhere('image.status = :status', { status: Status.APPROVED })
            .getMany();
        await this.imageService.uploadImages(room.id, EntityType.ROOM, images.map(image => image.url));
        return room;
    }



}

