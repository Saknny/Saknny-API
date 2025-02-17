import { Controller, Post, Param, UploadedFiles, UseInterceptors, Patch, UploadedFile, NotFoundException, Delete, Body, forwardRef, Inject } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RoomService } from './room.service';
import { roomImageUploadInterceptor } from './interceptors/interceptor.upload-file';
import { CreateRoomDto } from './dto/create-room.dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto/update-room.dto';
import { PendingRequestService } from '../request/pendingRequest.service';
import { currentUser } from '@src/libs/decorators/currentUser.decorator';
import { currentUserType } from '@src/libs/types/current-user.type';
import { Type } from '../request/entities/enum/type.enum';
import { EntityType } from '../request/entities/enum/entityType.enum';
import { ReferenceType } from '../request/entities/enum/referenceType.enum';

@Controller('room')
export class RoomController {
    constructor(private readonly roomService: RoomService,
        @Inject(forwardRef(() => PendingRequestService))
        private readonly pendingRequestService: PendingRequestService
    ) { }



    @Post(':id/create')
    async createRoom(@Param('id') apartmentId: string,
        @Body() createRoomDto: CreateRoomDto) {
        return this.roomService.createRoom(apartmentId, createRoomDto);
    }

    @Patch(':id/update')
    async updateRoom(@Param('id') roomId: string,
        @Body() updateRoomDto: UpdateRoomDto) {
        return this.roomService.updateRoom(roomId, updateRoomDto);
    }

    @Delete(':id/delete')
    async deleteRoom(@Param('id') roomId: string) {
        return this.roomService.deleteRoom(roomId);
    }


    @Post(':id/upload-images')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 10 }], {
        storage: diskStorage({
            destination: './uploads/rooms',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                callback(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
            },
        }),
    }))
    async uploadRoomImages(@Param('id') id: string, @UploadedFiles() files: { images?: Express.Multer.File[] }
        , @currentUser() user: currentUserType) {
        const imageFilenames = files.images?.map(file => file.filename) || [];
        return this.pendingRequestService.uploadImageRequest(user.id, id, Type.UPLOAD_ROOM, ReferenceType.ROOM_IMAGE, EntityType.ROOM, imageFilenames);
    }

    @Patch(':id/update-image')
    @UseInterceptors(roomImageUploadInterceptor())
    async updateRoomImage(
        @Param('id') imageId: string,
        @UploadedFile() file: Express.Multer.File,
        @currentUser() user: currentUserType
    ) {
        if (!file) {
            throw new NotFoundException('No file uploaded');
        }
        return this.pendingRequestService.uploadImageRequest(user.id, imageId, Type.UPDATE_ROOM, ReferenceType.ROOM_IMAGE, EntityType.ROOM, file.filename);
    }


    @Delete(':id/delete-image')
    async deleteRoomImage(@Param('id') imageId: string) {
        return this.roomService.deleteRoomImage(imageId);
    }
}
