import { Controller, UseInterceptors, Param, UploadedFiles, Body, Post, Req } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { CompleteProviderProfileInput } from './dtos/inputs/complete-profile.input';
import { currentUser } from '@src/libs/decorators/currentUser.decorator';
import { fileUploadInterceptor } from './interceptors/file-upload.interceptor';
@Controller('provider')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {
  }



  @Post(':id/complete-profile')
  @UseInterceptors(fileUploadInterceptor())
  async completeProfile(
    @Req() request: Request,
    @Param('id') id: string, // 🔹 Take ID as a parameter 
    @UploadedFiles()
    files: {
      idCard?: Express.Multer.File[];
      image?: Express.Multer.File[];
    },
    @Body() completeProfileDto: CompleteProviderProfileInput,
  ) {
    const idCard = files.idCard
      ? `/uploads/${files.idCard[0].filename}`
      : undefined;
    const image = files.image
      ? `/uploads/${files.image[0].filename}`
      : undefined;

    const updatedProvider = await this.providerService.completeProfile(
      id,
      completeProfileDto,
      idCard,
      image,
    );

    return { message: 'Profile completed successfully!', provider: updatedProvider };
  }
}

