import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

export const fileUploadInterceptor = () =>
  FileFieldsInterceptor(
    [
      { name: 'idCard', maxCount: 1 }, // Stored in memory
      { name: 'image', maxCount: 1 },  // Stored on disk
    ],
    {
      storage: {
        _handleFile(req, file, cb) {
          if (file.fieldname === 'image') {
            const uploadPath = './uploads';
            if (!fs.existsSync(uploadPath)) {
              fs.mkdirSync(uploadPath, { recursive: true });
            }

            const filename = `${file.fieldname}-${Date.now()}-${Math.round(
              Math.random() * 1e9
            )}${extname(file.originalname)}`;
            const fullPath = `${uploadPath}/${filename}`;

            const outStream = fs.createWriteStream(fullPath);
            file.stream.pipe(outStream);
            outStream.on('error', cb);
            outStream.on('finish', () => {
              cb(null, {
                destination: uploadPath,
                filename,
                path: fullPath,
                size: outStream.bytesWritten,
              });
            });
          } else if (file.fieldname === 'idCard') {
            // Use memoryStorage for idCard
            const mem = memoryStorage();
            mem._handleFile(req, file, cb);
          } else {
            cb(new Error('Invalid field'), null);
          }
        },
        _removeFile(req, file, cb) {
          if (file.path) {
            fs.unlink(file.path, cb);
          } else {
            cb(null);
          }
        },
      },
      fileFilter: (req, file, cb) => {
        if (file.fieldname === 'idCard' || file.fieldname === 'image') {
          cb(null, true);
        } else {
          cb(new Error('Unexpected field'), false);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }
  );
