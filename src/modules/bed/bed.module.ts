import { forwardRef, Module } from '@nestjs/common';
import { BedService } from './bed.service';
import { BedController } from './bed.controller';
import { DatabaseModule } from '@src/configs/database/database.module';
import { Bed } from './entities/bed.entity/bed.entity';
import { Apartment } from '../apartment/entities/apartment.entity/apartment.entity';

import { Room } from '../room/entities/room.entity/room.entity';
import { PendingRequestModule } from '../request/pendingRequest.module';
@Module({
  imports: [DatabaseModule.forFeature([Bed, Apartment, Room])],
  providers: [BedService],
  controllers: [BedController],
  exports: [BedService]
})
export class BedModule { }
