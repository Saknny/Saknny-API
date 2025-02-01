import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  PayloadTooLargeException,
  UnprocessableEntityException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ErrorCodeEnum } from '../application/exceptions/error-code.enum';
import { ENUM_FILE_DOC_MIME } from '../enums/file.enum';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { get } from 'env-var';

@Injectable()
export class FilePDFInterceptor implements NestInterceptor {
  constructor() {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<Promise<any> | string>> {
    const ctx: HttpArgumentsHost = context.switchToHttp();
    const { file, files } = ctx.getRequest();
    const finalFiles = files || file;

    if (Array.isArray(finalFiles)) {
      const maxFiles = parseInt(get('maxFiles').asString()) || 5;

      if (finalFiles.length > maxFiles)
        throw new UnprocessableEntityException({
          statusCode: ErrorCodeEnum.FILE_MAX_ERROR,
          message: 'Max number of files exceeded',
        });

      for (const file of finalFiles) await this.validate(file);
    } else if (typeof finalFiles === 'object') {
      Object.keys(finalFiles).forEach(async (key) => {
        finalFiles[key].forEach(async (file: Express.Multer.File) => {
          await this.validate(file);
        });
      });
    } else {
      await this.validate(finalFiles);
    }

    return next.handle();
  }

  async validate(file: Express.Multer.File): Promise<void> {
    if (!file) {
      throw new UnprocessableEntityException({
        statusCode: ErrorCodeEnum.FILE_NEEDED_ERROR,
        message: 'File is required',
      });
    }

    const { size, mimetype } = file;
    const maxSize = parseInt(get('maxSize').asString()) || 5e6;

    if (
      !Object.values(ENUM_FILE_DOC_MIME).find(
        (val) => val === mimetype.toLowerCase(),
      )
    ) {
      throw new UnsupportedMediaTypeException({
        statusCode: ErrorCodeEnum.FILE_EXTENSION_ERROR,
        message: 'Unsupported file type. Please upload a PDF file.',
      });
    } else if (size > maxSize) {
      throw new PayloadTooLargeException({
        statusCode: ErrorCodeEnum.FILE_MAX_SIZE_ERROR,
        message: 'File size too large. Please upload a file less than 5MB.',
      });
    }
  }
}
