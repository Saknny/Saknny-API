import { Controller, UseInterceptors, Param, UploadedFiles, Body, Post, Req, Patch, Get, Inject, forwardRef } from '@nestjs/common';
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
  constructor(private readonly providerService: ProviderService,
    @Inject(forwardRef(() => PendingRequestService))
    private readonly pendingRequestService: PendingRequestService
  ) {

  }



  @Post('complete-profile')
  @UseInterceptors(fileUploadInterceptor())
  async completeProfile(
    @currentUser() { id }: currentUserType,
    @UploadedFiles()
    files: {
      idCard?: Express.Multer.File[];
      image?: Express.Multer.File[];
    },
    @Body() completeProfileDto: CompleteProviderProfileInput,
  ) {

    completeProfileDto.idCard = files.idCard[0].buffer.toString('base64'); // Store as binary
    completeProfileDto.image = `/uploads/${files.image[0].filename}`;
    console.log('my id ' , id);
    return await this.pendingRequestService.submitProfileUpdate(id , EntityType.PROVIDER , completeProfileDto  ,Type.PROFILE_COMPLETE)
    // return { message: 'Profile completed successfully!', provider: updatedProvider };
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

      if (Buffer.isBuffer(files.idCard[0].buffer)) {
        updateProfileDto.idCard = files.idCard[0].buffer.toString('base64');
      }
    }

    if (files.image && files.image.length > 0) {
      updateProfileDto.image = `/uploads/${files.image[0].filename}`;
    }

    console.log('controller');
    return await this.pendingRequestService.submitProfileUpdate(id , EntityType.PROVIDER , updateProfileDto , Type.PROFILE_UPDATE) 
  }





  @Get(':providerId/apartments')
  async getProviderApartments(@Param('providerId') providerId: string): Promise<Apartment[]> {
    return this.providerService.getProviderApartments(providerId);
  }




}

