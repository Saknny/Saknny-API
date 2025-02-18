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
        @Inject(forwardRef(() => ApartmentService))
        private readonly apartmentService: ApartmentService,

        @Inject(forwardRef(() => RoomService))
        private readonly roomService: RoomService,

        @Inject(forwardRef(() => BedService))
        private readonly bedService: BedService,
        @Inject(forwardRef(() => ProviderService))
        private readonly providerService: ProviderService,
        @Inject(forwardRef(() => StudentService))
        private readonly studentService: StudentService,
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

        // console.log(request);

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
        const request = await this.pendingRequestRepo
            .createQueryBuilder('request')
            .leftJoinAndSelect('request.pendingProfile', 'pendingProfile')
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
        } else if (request.type == Type.PROFILE_COMPLETE) {
            const pendingProfile = await this.pendingProfileRepo.findOne({ id: request.pendingProfile.id });

            if (pendingProfile.entityType == EntityType.PROVIDER) {
                this.providerService.updateProfile(pendingProfile.userId, pendingProfile.data);
            } else {
                console.log("here")
                console.log(pendingProfile.data);
                this.studentService.completeProfile(pendingProfile.userId, pendingProfile.data);
            }
        } else if (request.type == Type.PROFILE_UPDATE) {
            const pendingProfile = await this.pendingProfileRepo.findOne({ id: request.pendingProfile.id });
            if (pendingProfile.entityType == EntityType.PROVIDER) {
                this.providerService.updateProfile(pendingProfile.userId, pendingProfile.data);
            } else {
                this.studentService.updateStudent(pendingProfile.userId, pendingProfile.data);
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


    async submitProfileUpdate(userId: string, entityType: EntityType, profileData: any, requestType: Type) {

        console.log(profileData)
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

        console.log('After');
        console.log(formattedData);

        console.log(userId)
        let request = await this.pendingRequestRepo
            .createQueryBuilder("pendingRequest")
            .leftJoinAndSelect("pendingRequest.pendingProfile", "pendingProfile")
            .where("pendingProfile.userId = :userId", { userId })
            .andWhere("pendingRequest.type = :type", { type: requestType })
            .andWhere("pendingRequest.status = :status", { status: Status.PENDING })
            .getOne();


        // console.log("here", request);
        if (request) {
            // console.log("exist!")
            // console.log(request);
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


}

