import { Controller, UseInterceptors, Param, UploadedFiles, Body, Post, Req, Patch } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { CompleteProviderProfileInput } from './dtos/inputs/complete-profile.input';

import { fileUploadInterceptor } from './interceptors/file-upload.interceptor';
import { UpdateProfileInput } from '../profile/dtos/inputs/update-profile.input';
import { UpdateProviderProfileInput } from './dtos/inputs/update-profile.input';
import { currentUser } from '@src/libs/decorators/currentUser.decorator';
import { currentUserType } from '@src/libs/types/current-user.type';
import { Auth } from '@src/libs/decorators/auth.decorator';



@Controller('provider')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {
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
    const updatedProvider = await this.providerService.updateProfile(id, completeProfileDto);

    return { message: 'Profile completed successfully!', provider: updatedProvider };
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
    console.log('📌 Received files:', files);

    if (files.idCard && files.idCard.length > 0) {
      console.log('✅ idCard file received:', files.idCard[0]);
      console.log('📌 idCard Buffer Type:', typeof files.idCard[0].buffer); // Should be "object"
      console.log('📌 idCard Buffer:', files.idCard[0].buffer); // Log the buffer

      if (Buffer.isBuffer(files.idCard[0].buffer)) {
        updateProfileDto.idCard = files.idCard[0].buffer.toString('base64'); // Convert to Base64
      } else {
        console.log('❌ idCard is NOT a Buffer! Something is wrong.');
      }
    }

    if (files.image && files.image.length > 0) {
      console.log('✅ Image file received:', files.image[0]);
      updateProfileDto.image = `/uploads/${files.image[0].filename}`;
    } 
    
    console.log('📌 updateProfileDto BEFORE sending to service:', updateProfileDto);

    const updatedProvider = await this.providerService.updateProfile(id, updateProfileDto);
    return { message: 'Profile updated successfully!', provider: updatedProvider };
  }


}

