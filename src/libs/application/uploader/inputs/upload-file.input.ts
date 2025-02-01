import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { FileModelEnum, FileUploadUseCaseEnum } from '../enums/file.enum';
import {
  ModelWhichUploadedFor,
  Upload,
  UploadedFile,
} from '../types/uploader.type';

export class UploadFileInput {
  file: Upload | string;
}

export class FileHandlingInput {
  @IsString()
  file: Upload | string | UploadedFile;

  @IsNotEmpty()
  @IsEnum(FileModelEnum)
  saveTo: FileModelEnum;

  @IsNotEmpty()
  modelWhichUploadedFor?: ModelWhichUploadedFor;

  @IsString()
  oldFile?: string;

  @IsNotEmpty()
  @IsEnum(FileUploadUseCaseEnum)
  useCase: FileUploadUseCaseEnum;
}
