import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ErrorCodeEnum } from '../application/exceptions/error-code.enum';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { BaseHttpException } from '../application/exceptions/base-http-exception';
import { get } from 'env-var';

@Injectable()
export class FileVideoInterceptor implements NestInterceptor {
  private readonly maxFiles: number;
  private readonly maxSize: number;
  private readonly allowedVideoMimes: string[];

  constructor() {
    this.maxFiles = parseInt(get('VIDEO_MAX_FILES').asString()) || 3; // Default to 3 files
    this.maxSize = parseInt(get('VIDEO_MAX_SIZE').asString()) || 50e6; // Default to 50MB
    this.allowedVideoMimes = ['video/mp4', 'video/mpeg', 'video/quicktime']; // Add more if needed
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
    return this.allowedVideoMimes.includes(mimetype.toLowerCase());
  }
}
