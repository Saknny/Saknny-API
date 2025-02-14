import { Module } from '@nestjs/common';
import { ApartmentService } from './apartment.service';
import { ApartmentController } from './apartment.controller';
import { DatabaseModule } from '@src/configs/database/database.module';
import { Apartment } from './entities/apartment.entity/apartment.entity';
import { Room } from '../room/entities/room.entity/room.entity';
import { Bed } from '../bed/entities/bed.entity/bed.entity';
import { ProviderModule } from '../provider/provider.module';

@Module({
  imports: [DatabaseModule.forFeature([Apartment,Room,Bed])
  ,ProviderModule],
  providers: [ApartmentService],
  controllers: [ApartmentController],
  exports:[ApartmentService]

})
export class ApartmentModule {}
