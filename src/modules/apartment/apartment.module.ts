import { Module } from '@nestjs/common';
import { ApartmentService } from './apartment.service';
import { ApartmentController } from './apartment.controller';
import { DatabaseModule } from '@src/configs/database/database.module';
import { Apartment } from './entities/apartment.entity/apartment.entity';

@Module({
  imports: [DatabaseModule.forFeature([Apartment])],
  providers: [ApartmentService],
  controllers: [ApartmentController],
  exports:[ApartmentService]

})
export class ApartmentModule {}
