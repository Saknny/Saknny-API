import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from '@src/configs/database/database.module';
import { PendingRequestModule } from '../request/pendingRequest.module';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { Image } from './image.entity';
import { Apartment } from '../apartment/entities/apartment.entity/apartment.entity';
@Module({
  imports: [DatabaseModule.forFeature([Image,Apartment]),
  forwardRef(() => PendingRequestModule)],
  providers: [ImageService],
  controllers: [ImageController],
  exports: [ImageService]
})
export class ImageModule { }
