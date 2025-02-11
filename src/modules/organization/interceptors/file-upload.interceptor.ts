import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const fileUploadInterceptor = () =>
  FileFieldsInterceptor(
    [
      { name: 'idCard', maxCount: 1 },
      { name: 'image', maxCount: 1 },
    ],
    {
      storage: diskStorage({
        destination: './uploads', // 📂 Save files in 'uploads' folder
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
        },
      }),
    },
  );
