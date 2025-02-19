import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { extname } from 'path';
import * as multer from 'multer';
import * as fs from 'fs';

export const fileUploadInterceptor = () =>
  FileFieldsInterceptor(
    [
      { name: 'idCard', maxCount: 1 },
      { name: 'image', maxCount: 1 }, 
    ],
    {
      
      storage: multer.memoryStorage(),
      fileFilter: (req, file, callback) => {
       
        if (file.fieldname === 'image') {
          
          const uploadPath = './uploads';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }

          file.destination = uploadPath;
          file.filename = `${file.fieldname}-${Date.now()}-${Math.round(
            Math.random() * 1e9
          )}${extname(file.originalname)}`;
          file.path = `${uploadPath}/${file.filename}`;
        } else if (file.fieldname === 'idCard') {

          console.log(`📥 Storing idCard in memory: ${file.originalname}`);
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, 
    }
  );
