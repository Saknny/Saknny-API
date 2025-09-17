import { FileFieldsInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';


export const fileUploadInterceptor = () =>
    FileFieldsInterceptor(
        [
            { name: 'document', maxCount: 1 },
        ],
        {
            storage: multer.memoryStorage(),
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
        }
    );
