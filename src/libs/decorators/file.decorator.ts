import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ENUM_FILE_TYPE } from '../enums/file.enum';
import { FilePDFInterceptor } from '../interceptors/file.pdf.interceptor';
import { FileImageInterceptor } from '../interceptors/file.image.interceptor';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { FileStorageInterceptor } from '../interceptors/storage.interceptor';
import { FileVideoInterceptor } from '../interceptors/filevideo.interceptor';

export function UploadFileSingle(
  field: string,
  type: ENUM_FILE_TYPE,
  storeLocal: boolean = false,
): any {
  const interceptors = [FileInterceptor(field)];

  switch (type) {
    case ENUM_FILE_TYPE.IMAGE:
      interceptors.push(FileImageInterceptor);
      if (storeLocal) interceptors.push(FileStorageInterceptor);
      break;

    case ENUM_FILE_TYPE.PDF:
      interceptors.push(FilePDFInterceptor);
      if (storeLocal) interceptors.push(FileStorageInterceptor);
      break;

    case ENUM_FILE_TYPE.VIDEO:
      interceptors.push(FileVideoInterceptor);
      if (storeLocal) interceptors.push(FileStorageInterceptor);
      break;

    default:
      break;
  }

  return applyDecorators(UseInterceptors(...interceptors));
}

export function UploadFileMultiple(
  fields: { name: string; maxCount: number }[],
  type: ENUM_FILE_TYPE,
): any {
  switch (type) {
    case ENUM_FILE_TYPE.IMAGE:
      return applyDecorators(
        UseInterceptors(FileFieldsInterceptor(fields), FileImageInterceptor),
      );
    case ENUM_FILE_TYPE.PDF:
      return applyDecorators(
        UseInterceptors(FileFieldsInterceptor(fields), FilePDFInterceptor),
      );
    default:
      return applyDecorators(UseInterceptors(FileFieldsInterceptor(fields)));
  }
}
