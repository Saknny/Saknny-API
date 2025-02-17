import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { DatabaseModule } from '@src/configs/database/database.module';
import { Room } from './entities/room.entity/room.entity';
import { Apartment } from '../apartment/entities/apartment.entity/apartment.entity';
import { RoomImage } from './entities/roomImage.entity';
import { ApartmentModule } from '../apartment/apartment.module';

@Module({
  imports: [DatabaseModule.forFeature([Room, Apartment, RoomImage])
,ApartmentModule],
  providers: [RoomService],
  controllers: [RoomController],
  exports: [RoomService]
})
export class RoomModule { }
