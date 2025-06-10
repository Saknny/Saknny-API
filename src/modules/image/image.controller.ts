import { Body, Controller, Delete, forwardRef, Get, Inject, NotFoundException, Param, Patch, Post, Query, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { PendingRequestService } from "../request/pendingRequest.service";
import { ImageService } from "./image.service";
import { ImageUploadFileInterceptor } from "./interceptors/interceptor.upload-file";
import { currentUser } from "@src/libs/decorators/currentUser.decorator";
import { currentUserType } from "@src/libs/types/current-user.type";
import { Type } from "../request/entities/enum/type.enum";
import { EntityType } from "../request/entities/enum/entityType.enum";
import { ImageUploadFilesInterceptor } from "./interceptors/interceptor.upload-files";
import { ImageDto } from "./dto/image.dto";
import { Serialize } from "@src/libs/interceptors/serialize.interceptor";
import { ApartmentImagesResponseDto } from "../apartment/dto/image-response.dto";


@Controller('image')
export class ImageController {
    constructor(private readonly imageService: ImageService,
        @Inject(forwardRef(() => PendingRequestService))
        private readonly pendingRequestService: PendingRequestService
    ) {
    }

    @Post(':id/upload-images')
    @UseInterceptors(ImageUploadFilesInterceptor())
    async uploadImages(@Param('id') requestItemId: string
        , @UploadedFiles() files: { images?: Express.Multer.File[] }
        ) {
        const imageFilenames = files.images?.map(file => file.filename) || [];

        return this.pendingRequestService.UploadImagesRequest( requestItemId, imageFilenames);
    }

    @Patch(':id/update-image')
    @UseInterceptors(ImageUploadFileInterceptor())
    async updateImage(
        @Param('id') imageId: string,
        @UploadedFile() file: Express.Multer.File,
        @currentUser() user: currentUserType,
        @Query('entityType') entityType: EntityType
    ) {
        if (!file) {
            throw new NotFoundException('No file uploaded');
        }
        const requestTypeKey = (`UPLOAD_${entityType}`);
        const requestType = Type[requestTypeKey];
        // return this.pendingRequestService.uploadImageRequest(user.id, imageId, requestType, EntityType.ROOM, file.filename);
    }


    @Delete(':id/delete-image')
    async deleteImage(@Param('id') imageId: string
        , @Query('entityType') entityType: EntityType) {
        return this.imageService.deleteImage(imageId, entityType);
    }

    @Get('')
    async getImage(@Body() imageDto:ImageDto) {
        return this.imageService.getImage(imageDto);
    }
   
    @Get('apartments/:id/images')
    async getApartmentImages(
    @Param('id') apartmentId: string
    ) {
    return this.imageService.getApartmentImages(apartmentId);
    }
}