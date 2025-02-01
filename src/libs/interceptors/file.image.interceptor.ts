import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ENUM_FILE_IMAGE_MIME } from '../enums/file.enum';
import { ErrorCodeEnum } from '../application/exceptions/error-code.enum';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { BaseHttpException } from '../application/exceptions/base-http-exception';
import { get } from 'env-var';

@Injectable()
export class FileImageInterceptor implements NestInterceptor {
  private readonly maxFiles: number;
  private readonly maxSize: number;

  constructor() {
    this.maxFiles = parseInt(get('maxFiles').asString()) || 5;
    this.maxSize = parseInt(get('maxSize').asString()) || 5e6;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<Promise<any> | string>> {
    const ctx: HttpArgumentsHost = context.switchToHttp();
    const { file, files } = ctx.getRequest();

    if (file) await this.validateFile(file);

    if (files) await this.processFiles(files);

    return next.handle();
  }

  private async processFiles(files: any): Promise<void> {
    if (Array.isArray(files)) {
      await this.validateFileArray(files);
    } else if (typeof files === 'object') {
      await this.validateFileObject(files);
    } else {
      await this.validateFile(files);
    }
  }

  private async validateFileArray(files: Express.Multer.File[]): Promise<void> {
    if (files.length > this.maxFiles) {
      throw new BaseHttpException(ErrorCodeEnum.FILE_MAX_ERROR);
    }

    await Promise.all(files.map((file) => this.validateFile(file)));
  }

  private async validateFileObject(
    files: Record<string, Express.Multer.File[]>,
  ): Promise<void> {
    const validationTasks = Object.keys(files).map((key) =>
      Promise.all(files[key].map((file) => this.validateFile(file))),
    );

    await Promise.all(validationTasks);
  }

  private async validateFile(file: Express.Multer.File): Promise<void> {
    if (!file) {
      throw new BaseHttpException(ErrorCodeEnum.FILE_NEEDED_ERROR);
    }
    const { size, mimetype } = file;

    if (!this.isValidMimeType(mimetype)) {
      throw new UnsupportedMediaTypeException(
        ErrorCodeEnum.FILE_EXTENSION_ERROR,
      );
    }

    if (size > this.maxSize) {
      throw new PayloadTooLargeException(ErrorCodeEnum.FILE_MAX_SIZE_ERROR);
    }
  }

  private isValidMimeType(mimetype: string): boolean {
    return Object.values(ENUM_FILE_IMAGE_MIME).some(
      (val) => val === mimetype.toLowerCase(),
    );
  }
}
