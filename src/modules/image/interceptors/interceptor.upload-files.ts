import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

export const ImageUploadFilesInterceptor = () =>
    FileFieldsInterceptor([{ name: 'images', maxCount: 10 }], {
        storage: diskStorage({
            destination: (req, file, callback) => {
                const entityType = req.query.entityType; 

                if (!entityType) {
                    return callback(new Error('entityType is required'), null);
                }

                const uploadPath =`./uploads/${ entityType}`;

                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }

                callback(null, uploadPath);
            },
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                callback(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
            },
        }),
    });
