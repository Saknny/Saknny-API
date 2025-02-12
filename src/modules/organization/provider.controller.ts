import { Controller, UseInterceptors, Param, UploadedFiles, Body, Post, Req, Patch } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { CompleteProviderProfileInput } from './dtos/inputs/complete-profile.input';

import { fileUploadInterceptor } from './interceptors/file-upload.interceptor';
import { UpdateProfileInput } from '../profile/dtos/inputs/update-profile.input';
import { UpdateProviderProfileInput } from './dtos/inputs/update-profile.input';
import { currentUser } from '@src/libs/decorators/currentUser.decorator';
import { currentUserType } from '@src/libs/types/current-user.type';
import { Auth } from '@src/libs/decorators/auth.decorator';


@Auth({ allow: 'provider' })
@Controller('provider')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {
  }



  @Post('complete-profile')
  @UseInterceptors(fileUploadInterceptor())
  async completeProfile(
    @currentUser() {id}:currentUserType,
    @UploadedFiles()
    files: {
      idCard?: Express.Multer.File[];
      image?: Express.Multer.File[];
    },
    @Body() completeProfileDto: CompleteProviderProfileInput,
  ) {
    completeProfileDto.idCard = files.idCard ? `/uploads/${files.idCard[0].filename}` : undefined;
    completeProfileDto.image = files.image ? `/uploads/${files.image[0].filename}` : undefined;

    const updatedProvider = await this.providerService.updateProfile(
      id,
      completeProfileDto

    );

    return { message: 'Profile completed successfully!', provider: updatedProvider };
  }

  @Patch('update-profile')
  @UseInterceptors(fileUploadInterceptor())
  async updateProfile(
    @currentUser() {id}:currentUserType,
    @UploadedFiles()
    files: {
      idCard?: Express.Multer.File[];
      image?: Express.Multer.File[];
    },
    @Body() updateProfileDto: UpdateProviderProfileInput,
  ) {

    updateProfileDto.idCard = files.idCard ? `/uploads/${files.idCard[0].filename}` : undefined;
    updateProfileDto.image = files.image ? `/uploads/${files.image[0].filename}` : undefined;

    const updatedProvider = await this.providerService.updateProfile(
      id,
      updateProfileDto,
    );

    return { message: 'Profile completed successfully!', provider: updatedProvider };
  }
}

