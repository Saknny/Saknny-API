import { forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PendingRequest } from "./entities/pendingRequest.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseRepository } from "@src/libs/types/base-repository";
import { EntityType } from "./entities/enum/entityType.enum";
import { ImageApproval } from "./entities/imageApproval.entity";
import { Type } from "./entities/enum/type.enum";
import { Provider } from "../provider/entities/provider.entity";
import { ImageApprovalDto } from "./dto/image-approval.dto";
import { RequestApprovalDto } from "./dto/RequestApproval.dto";
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

    async uploadImageRequest(userId: string, id: string, requestType: Type,
        entityType: EntityType, imageFilenames: string[] | string) {


        //     const filenamesArray = Array.isArray(imageFilenames) ? imageFilenames : [imageFilenames];

        //     const provider = await this.providerRepo.findOneBy({ userId: userId });
        //     if (!provider) {
        //         throw new NotFoundException('provider not found');
        //     }


        //     var request = await this.pendingRequestRepo
        //         .createQueryBuilder("pendingRequest")
        //         .leftJoinAndSelect("pendingRequest.provider", "provider")
        //         .leftJoinAndSelect("pendingRequest.imageApprovals", "imageApprovals")
        //         .where("provider.id = :providerId", { providerId: provider.id })
        //         .where("imageApprovals.referenceId = :referenceId", { referenceId: id })
        //         .andWhere("pendingRequest.type = :requestType", { requestType })
        //         .andWhere("pendingRequest.status = :status", { status: Status.PENDING })
        //         .getOne();



        //     if (request) {

        //         await this.deleteApprovalImages(request.id);

        //     } else {
        //         request = await this.pendingRequestRepo.create({
        //             provider,
        //             type: requestType
        //         })
        //     }

        //     await this.pendingRequestRepo.save(request);

        //     const images = filenamesArray.map(filename =>
        //         this.imageApprovalRepo.create({
        //             referenceId: id,
        //             url: filename,
        //             type: requestType,
        //             entityType: entityType,
        //             pendingRequest: request
        //         })
        //     );

        //     await this.imageApprovalRepo.save(images);
    }



    async updateImageApproval(id: string, body: ImageApprovalDto) {
        //     const imageApproval = await this.imageApprovalRepo.findOne({ id });
        //     if (!imageApproval) {
        //         throw new NotFoundException('record not found')
        //     }
        //     Object.assign(imageApproval, body);
        //     return await this.imageApprovalRepo.save(imageApproval);
    }

    async updateRequestApproval(id: string, body: RequestApprovalDto) {
        const request = await this.pendingRequestRepo
            .createQueryBuilder('request')
            .leftJoinAndSelect('request.items', 'items')
            .leftJoinAndSelect('items.request', 'requestItemRequest')
            .where('request.id = :id', { id })
            .getOne();
        const items = request.items;

        const apartments = items.filter(item => item.type === EntityType.APARTMENT);
        const rooms = items.filter(item => item.type === EntityType.ROOM);
        const beds = items.filter(item => item.type === EntityType.BED);

        await Promise.all(apartments.map(item => this.ApproveRequestItem(request.userId, item)));
        await Promise.all(rooms.map(item => this.ApproveRequestItem(request.userId, item)));
        await Promise.all(beds.map(item => this.ApproveRequestItem(request.userId, item)));


        //     if (!request) {

        //         throw new NotFoundException('record not found');
        //     }
        //     if (body.status == Status.REJECTED) {
        //         Object.assign(request, body);
        //         await this.pendingRequestRepo.save(request);
        //         return;
        //     }
        //     Object.assign(request, body);
        //     await this.pendingRequestRepo.save(request);

        //     if (request.type.startsWith('UPLOAD')) {
        //         const images = await this.getApprovedImages(request.id);
        //         if (images.length > 0) {
        //             await this.imageService.uploadImages(images[0].referenceId, images[0].entityType, images.map(image => image.url))
        //         }
        //     } else if (request.type.startsWith('UPDATE')) {
        //         const images = await this.getApprovedImages(request.id);
        //         if (images.length) {
        //             await this.imageService.updateImage(images[0].referenceId, images[0].entityType, images[0].url)
        //         }
        //     } else if (request.type == Type.PROFILE_COMPLETE) {
        //         const pendingProfile = await this.pendingProfileRepo.findOne({ id: request.pendingProfile.id });

        //         if (pendingProfile.entityType == EntityType.PROVIDER) {
        //             this.providerService.updateProfile(pendingProfile.userId, pendingProfile.data);
        //         } else {

        //             this.studentService.completeProfile(pendingProfile.userId, pendingProfile.data);
        //         }
        //     } else if (request.type == Type.PROFILE_UPDATE) {
        //         const pendingProfile = await this.pendingProfileRepo.findOne({ id: request.pendingProfile.id });
        //         if (pendingProfile.entityType == EntityType.PROVIDER) {
        //             this.providerService.updateProfile(pendingProfile.userId, pendingProfile.data);
        //         } else {
        //             this.studentService.updateStudent(pendingProfile.userId, pendingProfile.data);
        //         }
        //     } else if (request.type == Type.DOCUMENT_UPLOAD) {
        //         const apartmentDocument = await this.pendingDocumentRepo.findOne({ id: request.pendingDocument.id });
        //         this.apartmentService.uploadDocuments(apartmentDocument.entityId, apartmentDocument.document);

        //     }


    }
    async getApprovedImages(id: string) {
        //     const request = await this.pendingRequestRepo.findOne({ id });
        //     if (!request) {
        //         throw new NotFoundException('record not found');
        //     }

        //     const images = await this.imageApprovalRepo
        //         .createQueryBuilder("imageApproval")
        //         .where("imageApproval.pendingRequestId = :requestId", { requestId: id }) // Filter by request ID
        //         .andWhere("imageApproval.status = :status", { status: Status.APPROVED }) // Filter by approved status
        //         .getMany();
        //     return images;

    }




    deleteApprovalImages(id: string) {
        //     const pendingRequest = await this.pendingRequestRepo.findOneBy({ id });
        //     if (!pendingRequest) {
        //         throw new NotFoundException('Pending request not found');
        //     }

        //     await this.imageApprovalRepo.delete({ pendingRequest: { id } });

        //     console.log("Images deleted successfully for request ID:", id);
    }



    async getPendingRequests() {
        //     return await this.pendingRequestRepo.find({ where: { status: Status.PENDING } });// relation
    }


    async submitProfileUpdate(userId: string, entityType: EntityType, profileData: any, requestType: Type) {


        //     const formattedData = {
        //         gender: profileData?.gender ?? null,
        //         phone: profileData?.phone ?? null,
        //         instagram: profileData?.instagram ?? null,
        //         facebook: profileData?.facebook ?? null,
        //         linkedin: profileData?.linkedin ?? null,
        //         image: profileData?.image ?? null,
        //         idCard: profileData?.idCard ?? null,
        //         hobbies: profileData?.hobbies ?? null,
        //         socialPerson: profileData?.socialPerson ?? null,
        //         level: profileData?.level ?? null,
        //         university: profileData?.university ?? null,
        //         smoking: profileData?.smoking ?? null,
        //         major: profileData?.major ?? null,
        //         lastName: profileData?.lastName ?? null,
        //         firstName: profileData?.firstName ?? null,
        //     };


        //     let request = await this.pendingRequestRepo
        //         .createQueryBuilder("pendingRequest")
        //         .leftJoinAndSelect("pendingRequest.pendingProfile", "pendingProfile")
        //         .where("pendingProfile.userId = :userId", { userId })
        //         .andWhere("pendingRequest.type = :type", { type: requestType })
        //         .andWhere("pendingRequest.status = :status", { status: Status.PENDING })
        //         .getOne();

        //     if (request) {

        //         const pendingProfile = await this.pendingProfileRepo.findOne({ id: request.pendingProfile.id })
        //         pendingProfile.data = formattedData;
        //         await this.pendingProfileRepo.save(pendingProfile);
        //     } else {

        //         const pendingProfile = this.pendingProfileRepo.create({ data: formattedData, userId: userId, entityType });
        //         await this.pendingProfileRepo.save(pendingProfile);

        //         request = this.pendingRequestRepo.create({ type: requestType, pendingProfile: pendingProfile });
        //         await this.pendingRequestRepo.save(request);

        //     }

        //     return { message: "Profile update submitted for approval" };
    }



    async uploadDocumentRequest(apartmentId: string, document: string) {
        //     let request = await this.pendingRequestRepo
        //         .createQueryBuilder("pendingRequest")
        //         .leftJoinAndSelect("pendingRequest.pendingDocument", "pendingDocument")
        //         .where("pendingDocument.entityId = :entityId", { entityId: apartmentId })
        //         .andWhere("pendingRequest.type = :type", { type: Type.DOCUMENT_UPLOAD })
        //         .andWhere("pendingRequest.status = :status", { status: Status.PENDING })
        //         .getOne();
        //     console.log(request);

        //     if (request) {
        //         const apartmentDocument = await this.pendingDocumentRepo.findOne({ id: request.pendingDocument.id })
        //         apartmentDocument.document = document;
        //         await this.pendingDocumentRepo.save(apartmentDocument);
        //     } else {

        //         const apartmentDocument = this.pendingDocumentRepo.create({ document, entityId: apartmentId });
        //         await this.pendingDocumentRepo.save(apartmentDocument);

        //         request = this.pendingRequestRepo.create({ type: Type.DOCUMENT_UPLOAD, pendingDocument: apartmentDocument });
        //         await this.pendingRequestRepo.save(request);

        //     }
    }




    async createApartmentRequest(
        userId: string,
        createApartmentDto: CreateApartmentDto
    ): Promise<{ requestId: string; requestItemId: string }> {
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
            type: EntityType.APARTMENT,
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

        return { requestId: pendingRequest.id, requestItemId: requestItem.id };
    }


    async addRoomRequest(
        requestId: string,
        createRoomtDto: CreateRoomDto
    ): Promise<{ requestId: string; requestItemId: string }> {

        const request = await this.pendingRequestRepo.findOne({ id: requestId });
        const { descriptionEn, descriptionAr, name, bedCount } = createRoomtDto;

        const requestItem = this.requestItemRepo.create({
            status: Status.PENDING,
            type: EntityType.ROOM,
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
        const { descriptionEn, descriptionAr, name, price, roomName } = createBedDto;

        const requestItem = this.requestItemRepo.create({
            status: Status.PENDING,
            type: EntityType.BED,
            referenceId: null,
            entityName: name,
            referenceType: EntityType.APARTMENT,

            data: {
                descriptionEn,
                descriptionAr,
                price,
                name,
                roomName

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
        const request = await this.pendingRequestRepo.findOne({ id: requestId });
        const item = await this.requestItemRepo.findOne({ request, type: EntityType.APARTMENT });
        item.document = document;
        await this.requestItemRepo.save(item);
    }


    async updateItemApproval(id: string, body: RequestApprovalDto) {
        const item = await this.requestItemRepo.findOne({ id });
        item.status = body.status;
        item.reason = body.reason;
        await this.requestItemRepo.save(item);
    }

    async ApproveRequestItem(userId: string, item: RequestItem) {
        const request = await this.pendingRequestRepo.findOne({ id: item.request.id })
        if (item.type == EntityType.APARTMENT_IMAGE) {
            //  create record for each image in image's table
            // and link image with appratment id and additionla info
            // change status requestItem

            const apartment = await this.apartmentService.createApartment(userId, item.data);
            request.referenceId = apartment.id;
            item.referenceId = item.entityId = apartment.id;

            const images = await this.imagesRepo.find({ where: { Item: item } });
            await this.imageService.uploadImages(apartment.id, EntityType.APARTMENT, images.map(image => image.url));

            await this.apartmentService.uploadDocuments(apartment.id, item.document);

        }
        else if (item.type == EntityType.APARTMENT_DOC) {
            //  for this item  create record in docs table and map the data from this item to doc record
            // link this docRecord with appartement id (refId, refType)
            // change status for this requestItem
        }
        else if (item.type == EntityType.ROOM) {






        } else if (item.type == EntityType.BED) {

            console.log(item.data.roomName)



        }

        await this.requestItemRepo.save(item);
        await this.pendingRequestRepo.save(request);
    }



    async approveBed(item: RequestItem, requestId: string) {
        const room = await this.requestItemRepo
            .createQueryBuilder('room')
            .leftJoinAndSelect('room.request', 'request')
            .where('room.type = :type', { type: EntityType.ROOM })
            .andWhere('room.entityName = :name', { name: item.data.roomName })
            .andWhere('room.requestId = :requestId', { requestId })
            .getOne();


        const bed = await this.bedService.createBed(room.entityId, item.data);
        item.entityId = bed.id;

        const images = await this.imagesRepo.find({ where: { Item: item } });
        await this.imageService.uploadImages(bed.id, EntityType.BED, images.map(image => image.url));




    }


    async approveRoom(item: RequestItem, apartmentId: string) {
        const room = await this.roomService.createRoom(apartmentId, item.data);
        item.entityId = room.id;

        const images = await this.imagesRepo.find({ where: { Item: item } });
        await this.imageService.uploadImages(room.id, EntityType.ROOM, images.map(image => image.url));

    }
    // switch (type)
    // approveBed
    // approveRoom
    // approveAppartment
    // approveAppartmentImages
    // approveRoomImages
    // approveBedImages
}

