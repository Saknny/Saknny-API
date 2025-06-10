import { Module } from '@nestjs/common';
import { DatabaseModule } from '@src/configs/database/database.module';
import { RentalRequest } from './entity/rental-request.entity';
import { Apartment } from '../apartment/entities/apartment.entity/apartment.entity';
import { Room } from '../room/entities/room.entity/room.entity';
import { Bed } from '../bed/entities/bed.entity/bed.entity';
import { RentalRequestController } from './controllers/rental-request.controller';
import { RentalRequestService } from './services/rental-request.service';
import { Student } from '../student/entities/student.entity';

@Module({
  imports: [
    DatabaseModule.forFeature([RentalRequest, Apartment, Room, Bed, Student]),
  ],
  controllers: [RentalRequestController],
  providers: [RentalRequestService],
  exports: [RentalRequestService],
})
export class BookingRequestModule {}
