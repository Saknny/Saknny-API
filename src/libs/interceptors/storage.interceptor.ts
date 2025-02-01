import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileStorageInterceptor implements NestInterceptor {
  private readonly uploadDir = path.join(
    process.cwd(),
    // __dirname,
    // '..',
    // '..',
    // '..',
    'public',
    'storage',
  );

  constructor() {
    this.ensureUploadDirectoryExists();
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request: Request = ctx.getRequest();

    if (!request.file) throw new BadRequestException('No file uploaded');

    const file = request.file;
    const storedFileName = this.storeFile(file);

    request.file.filename = storedFileName;
    return next.handle();
  }

  private ensureUploadDirectoryExists(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private storeFile(file: Express.Multer.File): string {
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.uploadDir, uniqueFileName);

    fs.writeFileSync(filePath, file.buffer);
    return uniqueFileName;
  }
}
