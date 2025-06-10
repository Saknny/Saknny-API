import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';

export const cardUploadInterceptor = () =>
    FileInterceptor(
        'idCard',

        {

            storage: multer.memoryStorage(),
            fileFilter: (req, file, callback) => {

                callback(null, true);
            },
            limits: { fileSize: 5 * 1024 * 1024 },
        }
    );
