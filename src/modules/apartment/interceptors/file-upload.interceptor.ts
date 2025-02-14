import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  private readonly fileInterceptor: NestInterceptor;

  constructor(fieldName: string, destination: string, maxFiles = 10) {
    this.fileInterceptor = new (FilesInterceptor(fieldName, maxFiles, {
      storage: diskStorage({
        destination: `./uploads/${destination}`,
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }))();
  }

  async intercept(context: ExecutionContext, next: CallHandler) {
    await this.fileInterceptor.intercept(context, next);
    return next.handle();
  }
}
