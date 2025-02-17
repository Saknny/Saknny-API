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
import { ReferenceType } from "./entities/enum/referenceType.enum";
import { ApartmentService } from "../apartment/apartment.service";
import { RoomService } from "../room/room.service";
import { BedService } from "../bed/bed.service";

@Injectable()
export class PendingRequestService {
    constructor(
        @InjectRepository(PendingRequest)
        private readonly pendingRequestRepo: BaseRepository<PendingRequest>,
        @InjectRepository(ImageApproval)
        private readonly imageApprovalRepo: BaseRepository<ImageApproval>,
        @InjectRepository(Provider)
        private readonly providerRepo: BaseRepository<Provider>,
        @Inject(forwardRef(() => ApartmentService))
        private readonly apartmentService: ApartmentService,

        @Inject(forwardRef(() => RoomService))
        private readonly roomService: RoomService,

        @Inject(forwardRef(() => BedService))
        private readonly bedService: BedService,
    ) { }

    async uploadImageRequest(userId: string, id: string, requestType: Type,
        referenceType: ReferenceType, entityType: EntityType, imageFilenames: string[] | string) {


        const filenamesArray = Array.isArray(imageFilenames) ? imageFilenames : [imageFilenames];

        const provider = await this.providerRepo.findOneBy({ userId: userId });
        if (!provider) {
            throw new NotFoundException('provider not found');
        }


        var request = await this.pendingRequestRepo
            .createQueryBuilder("pendingRequest")
            .leftJoinAndSelect("pendingRequest.provider", "provider") // Ensure provider relation is loaded
            .where("provider.id = :providerId", { providerId: provider.id }) // Filter by provider ID
            .andWhere("pendingRequest.type = :requestType", { requestType }) // Filter by type
            .andWhere("pendingRequest.status = :status", { status: Status.PENDING }) // Filter by status
            .getOne(); // Get the first matching record

        console.log(request);

        if (request) {

            await this.deleteApprovalImages(request.id);

        } else {
            request = await this.pendingRequestRepo.create({
                provider,
                type: requestType
            })
        }

        await this.pendingRequestRepo.save(request);

        const images = filenamesArray.map(filename =>
            this.imageApprovalRepo.create({
                referenceId: id,
                url: filename,
                type: requestType,
                entityType: entityType,
                referenceType: referenceType,
                pendingRequest: request
            })
        );

        await this.imageApprovalRepo.save(images);
    }



    async updateImageApproval(id: string, body: ImageApprovalDto) {
        const imageApproval = await this.imageApprovalRepo.findOne({ id });
        if (!imageApproval) {
            throw new NotFoundException('record not found')
        }
        Object.assign(imageApproval, body);
        return await this.imageApprovalRepo.save(imageApproval);
    }

    async updateRequestApproval(id: string, body: RequestApprovalDto) {
        const request = await this.pendingRequestRepo.findOne({ id });
        if (!request) {
            throw new NotFoundException('record not found');
        }
        if (body.status == Status.REJECTED) {
            Object.assign(request, body);
            await this.pendingRequestRepo.save(request);
            return;
        }
        Object.assign(request, body);
        await this.pendingRequestRepo.save(request);
        // console.log(request.type);
        if (request.type.startsWith('upload')) {
            const images = await this.getApprovedImages(request.id);
            if (images.length > 0) {
                if (request.type == Type.UPLOAD_APARTMENT) {
                    await this.apartmentService.saveApartmentImages(images[0].referenceId, images.map(image => image.url))
                }
                if (request.type == Type.UPLOAD_ROOM) {
                    await this.roomService.saveRoomImages(images[0].referenceId, images.map(image => image.url))
                }
                if (request.type == Type.UPLOAD_BED) {
                    await this.bedService.saveBedImages(images[0].referenceId, images.map(image => image.url))
                }
            }
        } else if (request.type.startsWith('update')) {

            const images = await this.getApprovedImages(request.id);

            if (images.length) {
                if (request.type == Type.UPDATE_APARTMENT) {
                    await this.apartmentService.updateApartmentImage(images[0].referenceId, images[0].url)
                }
                if (request.type == Type.UPDATE_ROOM) {
                    await this.roomService.updateRoomImage(images[0].referenceId, images[0].url)
                }
                if (request.type == Type.UPDATE_BED) {
                    console.log(images[0].url, images[0].referenceId);

                    await this.bedService.updateBedImage(images[0].referenceId, images[0].url)
                }
            }
        }


    }
    async getApprovedImages(id: string) {
        const request = await this.pendingRequestRepo.findOne({ id });
        if (!request) {
            throw new NotFoundException('record not found');
        }

        const images = await this.imageApprovalRepo
            .createQueryBuilder("imageApproval")
            .where("imageApproval.pendingRequestId = :requestId", { requestId: id }) // Filter by request ID
            .andWhere("imageApproval.status = :status", { status: Status.APPROVED }) // Filter by approved status
            .getMany();
        return images;

    }




    async deleteApprovalImages(id: string) {
        const pendingRequest = await this.pendingRequestRepo.findOneBy({ id });
        if (!pendingRequest) {
            throw new NotFoundException('Pending request not found');
        }

        await this.imageApprovalRepo.delete({ pendingRequest: { id } });

        console.log("Images deleted successfully for request ID:", id);
    }



    async getPendingRequests() {
        return await this.pendingRequestRepo.find({ where: { status: Status.PENDING } });// relation
    }

}

// upload
// get all images that is approved
// entity type