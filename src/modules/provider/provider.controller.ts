import {
  Controller,
  UseInterceptors,
  Param,
  UploadedFiles,
  Body,
  Post,
  Req,
  Patch,
  Get,
  Inject,
  forwardRef,
  ValidationPipe,
  UsePipes,
  BadRequestException,
} from '@nestjs/common';
import { ProviderService } from './provider.service';
import { CompleteProviderProfileInput } from './dtos/inputs/complete-profile.input';

import { fileUploadInterceptor } from './interceptors/file-upload.interceptor';
import { UpdateProfileInput } from '../profile/dtos/inputs/update-profile.input';
import { UpdateProviderProfileInput } from './dtos/inputs/update-profile.input';
import { currentUser } from '@src/libs/decorators/currentUser.decorator';
import { currentUserType } from '@src/libs/types/current-user.type';
import { Auth } from '@src/libs/decorators/auth.decorator';
import { Apartment } from '../apartment/entities/apartment.entity/apartment.entity';
import { PendingRequestService } from '../request/pendingRequest.service';
import { EntityType } from '../request/entities/enum/entityType.enum';
import { Type } from '../request/entities/enum/type.enum';

@Controller('provider')
export class ProviderController {
  constructor(
    private readonly providerService: ProviderService,
    @Inject(forwardRef(() => PendingRequestService))
    private readonly pendingRequestService: PendingRequestService,
  ) {}

  @Post('complete-profile')
  @UseInterceptors(fileUploadInterceptor())
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async completeProfile(
    @currentUser() { id }: currentUserType,
    @UploadedFiles()
    files: {
      idCard?: Express.Multer.File[];
      image?: Express.Multer.File[];
    },
    @Body() completeProfileDto: CompleteProviderProfileInput,
  ) {
    files = files || {};

    if (!files.idCard || files.idCard.length === 0) {
      throw new BadRequestException('ID Card is required');
    }

    if (files.idCard && files.idCard?.length > 0) {
      if (Buffer.isBuffer(files.idCard[0].buffer)) {
        completeProfileDto.idCard = files.idCard[0].buffer.toString('base64');
      }
    }

    if (files.image && files.image.length > 0) {
      completeProfileDto.image = `/uploads/${files.image[0].filename}`;
    }

    return await this.pendingRequestService.CreateProfileRequest(
      id,
      EntityType.PROVIDER,
      completeProfileDto,
      Type.PROFILE_COMPLETE,
    );
  }

  @Patch('update-profile')
  @UseInterceptors(fileUploadInterceptor())
  async updateProfile(
    @currentUser() { id }: currentUserType,
    @UploadedFiles()
    files: {
      idCard?: Express.Multer.File[];
      image?: Express.Multer.File[];
    },
    @Body() updateProfileDto: UpdateProviderProfileInput,
  ) {
    if (files.idCard && files.idCard.length > 0) {
      files = files || {};
      if (files.idCard && files.idCard?.length > 0) {
        if (Buffer.isBuffer(files.idCard[0].buffer)) {
          updateProfileDto.idCard = files.idCard[0].buffer.toString('base64');
        }
      }

      if (files.image && files.image?.length > 0) {
        updateProfileDto.image = `/uploads/${files.image[0].filename}`;
      }

      return await this.pendingRequestService.CreateProfileRequest(
        id,
        EntityType.PROVIDER,
        updateProfileDto,
        Type.PROFILE_UPDATE,
      );
    }
  }

  @Get('myApartments')
  async getProviderApartments(
    @currentUser() user: currentUserType,
  ): Promise<Apartment[]> {
    return this.providerService.getProviderApartments(user.id);
  }

  @Get(':providerId')
  getProvider(@Param('providerId') providerId: string) {
    return this.providerService.provider(providerId);
  }

  @Get(':providerId/board')
  getProviderBoard(@Param('providerId') providerId: string) {
    return this.providerService.providerBoard(providerId);
  }
}
