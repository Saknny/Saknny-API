import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as multer from 'multer';
import * as fs from 'fs';

export const fileUploadInterceptor = () =>
    FileFieldsInterceptor(
        [
            { name: 'idCard', maxCount: 1 }, // Store in memory as binary
            { name: 'image', maxCount: 1 },  // Store in filesystem
        ],
        {
            storage: multer.memoryStorage(), // Default: Store all files in memory
            fileFilter: (req, file, callback) => {
                if (file.fieldname === 'image') {

                    const uploadPath = './uploads';
                    if (!fs.existsSync(uploadPath)) {
                        fs.mkdirSync(uploadPath, { recursive: true });
                    }

                    // Assign the destination and filename manually
                    file.destination = uploadPath;
                    file.filename = `${file.fieldname}-${Date.now()}-${Math.round(
                        Math.random() * 1e9
                    )}${extname(file.originalname)}`;
                    file.path = `${uploadPath}/${file.filename}`;
                } else if (file.fieldname === 'idCard') {
                    // Store idCard in memory
                    console.log(`📥 Storing idCard in memory: ${file.originalname}`);
                }
                callback(null, true);
            },
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
        }
    );
