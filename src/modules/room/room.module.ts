import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { DatabaseModule } from '@src/configs/database/database.module';
import { Room } from './entities/room.entity/room.entity';

@Module({
  imports: [DatabaseModule.forFeature([Room])],
  providers: [RoomService],
  controllers: [RoomController],
  exports:[RoomService]
})
export class RoomModule {}
