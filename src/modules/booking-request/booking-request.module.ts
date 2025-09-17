import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from '@src/configs/database/database.module';
import { RentalRequest } from './entity/rental-request.entity';
import { Apartment } from '../apartment/entities/apartment.entity/apartment.entity';
import { Room } from '../room/entities/room.entity/room.entity';
import { Bed } from '../bed/entities/bed.entity/bed.entity';
import { RentalRequestController } from './controllers/rental-request.controller';
import { RentalRequestService } from './services/rental-request.service';
import { Student } from '../student/entities/student.entity';
import { RoomRentalRequest } from './entity/room-rental-request.entity';
import { RoomRentalController } from './controllers/room-rental-request.controller';
import { FavoriteApartment } from '../favoriteList/entities/favorite-apartment.entity';
import { Notification } from '../notification/entities/notification.entity/notification.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    DatabaseModule.forFeature([
      RentalRequest,
      RoomRentalRequest,
      Apartment,
      Room,
      Bed,
      Student,
      FavoriteApartment,
      
    ],),forwardRef(() =>NotificationModule)
  ],
  controllers: [RentalRequestController, RoomRentalController],
  providers: [RentalRequestService],
  exports: [RentalRequestService],
})
export class BookingRequestModule {}
