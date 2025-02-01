import {
  Req,
  Post,
  Body,
  UseGuards,
  Controller,
  UploadedFile,
} from '@nestjs/common';
import { Request } from 'express';
import { UploadFileInput } from '../inputs/upload-file.input';
import { Auth } from '../../../decorators/auth.decorator';
import { UploadFileSingle } from '../../../decorators/file.decorator';
import { ENUM_FILE_TYPE } from '../../../enums/file.enum';
import { JwtAuthenticationGuard } from '../../../guards/strategy.guards/jwt.guard';
import { FileType } from '../types/file.type';

@Controller('upload')
export class UploaderController {
  constructor() {}

  @UploadFileSingle('file', ENUM_FILE_TYPE.IMAGE, true)
  @Post('images')
  @Auth({ allow: 'authenticated' })
  @UseGuards(JwtAuthenticationGuard)
  async uploadImage(
    @UploadedFile() file: FileType,
    @Body() _: UploadFileInput,
    @Req() request: Request,
  ) {
    return `${request.protocol}://${request.get('host')}/${process.env.APP_NAME}/storage/${file.filename}`;
  }

  @UploadFileSingle('file', ENUM_FILE_TYPE.VIDEO, true)
  @Post('videos')
  @Auth({ allow: 'authenticated' })
  @UseGuards(JwtAuthenticationGuard)
  async uploadVideo(
    @UploadedFile() file: FileType,
    @Body() _: UploadFileInput,
    @Req() request: Request,
  ) {
    return `${request.protocol}://${request.get('host')}/${process.env.APP_NAME}/storage/${file.filename}`;
  }
}
