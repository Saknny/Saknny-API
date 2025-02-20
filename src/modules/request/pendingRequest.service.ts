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
import { PendingProfile } from "./entities/PendingProfile.Entity";
import { StudentService } from "../student/student.service";
import { ProviderService } from "../provider/provider.service";
import { ApartmentDocument } from "../apartment/entities/document.entity";
import { PendingDocument } from "./entities/pendingDocument.entity";
import { ImageService } from "../image/image.service";

@Injectable()
export class PendingRequestService {
    constructor(
        @InjectRepository(PendingRequest)
        private readonly pendingRequestRepo: BaseRepository<PendingRequest>,
        @InjectRepository(PendingProfile)
        private readonly pendingProfileRepo: BaseRepository<PendingProfile>,
        @InjectRepository(ImageApproval)
        private readonly imageApprovalRepo: BaseRepository<ImageApproval>,
        @InjectRepository(Provider)
        private readonly providerRepo: BaseRepository<Provider>,

        @InjectRepository(PendingDocument)
        private readonly pendingDocumentRepo: BaseRepository<PendingDocument>,

        @Inject(forwardRef(() => ApartmentService))
        private readonly apartmentService: ApartmentService,

        @Inject(forwardRef(() => ImageService))
        private readonly imageService: ImageService,

        @Inject(forwardRef(() => ProviderService))

        private readonly providerService: ProviderService,
        @Inject(forwardRef(() => StudentService))
        private readonly studentService: StudentService,
    ) { }

    async uploadImageRequest(userId: string, id: string, requestType: Type,
        entityType: EntityType, imageFilenames: string[] | string) {


        const filenamesArray = Array.isArray(imageFilenames) ? imageFilenames : [imageFilenames];

        const provider = await this.providerRepo.findOneBy({ userId: userId });
        if (!provider) {
            throw new NotFoundException('provider not found');
        }


        var request = await this.pendingRequestRepo
            .createQueryBuilder("pendingRequest")
            .leftJoinAndSelect("pendingRequest.provider", "provider")
            .leftJoinAndSelect("pendingRequest.imageApprovals", "imageApprovals")
            .where("provider.id = :providerId", { providerId: provider.id })
            .where("imageApprovals.referenceId = :referenceId", { referenceId: id })
            .andWhere("pendingRequest.type = :requestType", { requestType })
            .andWhere("pendingRequest.status = :status", { status: Status.PENDING })
            .getOne();



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
        const request = await this.pendingRequestRepo
            .createQueryBuilder('request')
            .leftJoinAndSelect('request.pendingProfile', 'pendingProfile')
            .leftJoinAndSelect('request.pendingDocument', 'pendingDocument')
            .where('request.id = :id', { id })
            .getOne();

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

        if (request.type.startsWith('UPLOAD')) {
            const images = await this.getApprovedImages(request.id);
            if (images.length > 0) {
                await this.imageService.uploadImages(images[0].referenceId, images[0].entityType, images.map(image => image.url))
            }
        } else if (request.type.startsWith('UPDATE')) {
            const images = await this.getApprovedImages(request.id);
            if (images.length) {
                await this.imageService.updateImage(images[0].referenceId, images[0].entityType, images[0].url)
            }
        } else if (request.type == Type.PROFILE_COMPLETE) {
            const pendingProfile = await this.pendingProfileRepo.findOne({ id: request.pendingProfile.id });

            if (pendingProfile.entityType == EntityType.PROVIDER) {
                this.providerService.updateProfile(pendingProfile.userId, pendingProfile.data);
            } else {

                this.studentService.completeProfile(pendingProfile.userId, pendingProfile.data);
            }
        } else if (request.type == Type.PROFILE_UPDATE) {
            const pendingProfile = await this.pendingProfileRepo.findOne({ id: request.pendingProfile.id });
            if (pendingProfile.entityType == EntityType.PROVIDER) {
                this.providerService.updateProfile(pendingProfile.userId, pendingProfile.data);
            } else {
                this.studentService.updateStudent(pendingProfile.userId, pendingProfile.data);
            }
        } else if (request.type == Type.DOCUMENT_UPLOAD) {
            const apartmentDocument = await this.pendingDocumentRepo.findOne({ id: request.pendingDocument.id });
            this.apartmentService.uploadDocuments(apartmentDocument.entityId, apartmentDocument.document);

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


    async submitProfileUpdate(userId: string, entityType: EntityType, profileData: any, requestType: Type) {


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

            const pendingProfile = await this.pendingProfileRepo.findOne({ id: request.pendingProfile.id })
            pendingProfile.data = formattedData;
            await this.pendingProfileRepo.save(pendingProfile);
        } else {

            const pendingProfile = this.pendingProfileRepo.create({ data: formattedData, userId: userId, entityType });
            await this.pendingProfileRepo.save(pendingProfile);

            request = this.pendingRequestRepo.create({ type: requestType, pendingProfile: pendingProfile });
            await this.pendingRequestRepo.save(request);

        }

        return { message: "Profile update submitted for approval" };
    }



    async uploadDocumentRequest(apartmentId: string, document: string) {
        let request = await this.pendingRequestRepo
            .createQueryBuilder("pendingRequest")
            .leftJoinAndSelect("pendingRequest.pendingDocument", "pendingDocument")
            .where("pendingDocument.entityId = :entityId", { entityId: apartmentId })
            .andWhere("pendingRequest.type = :type", { type: Type.DOCUMENT_UPLOAD })
            .andWhere("pendingRequest.status = :status", { status: Status.PENDING })
            .getOne();
        console.log(request);

        if (request) {
            const apartmentDocument = await this.pendingDocumentRepo.findOne({ id: request.pendingDocument.id })
            apartmentDocument.document = document;
            await this.pendingDocumentRepo.save(apartmentDocument);
        } else {

            const apartmentDocument = this.pendingDocumentRepo.create({ document, entityId: apartmentId });
            await this.pendingDocumentRepo.save(apartmentDocument);

            request = this.pendingRequestRepo.create({ type: Type.DOCUMENT_UPLOAD, pendingDocument: apartmentDocument });
            await this.pendingRequestRepo.save(request);

        }
    }


}

