import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from '@src/configs/database/database.module';
import { Apartment } from '../apartment/entities/apartment.entity/apartment.entity';
import { ApartmentModule } from '../apartment/apartment.module';
import { PendingRequestModule } from '../request/pendingRequest.module';
import { Review } from './entities/review.entity';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Student } from '../student/entities/student.entity';

@Module({
  imports: [DatabaseModule.forFeature([Review,Apartment,Student])],
  providers: [ReviewService],
  controllers: [ReviewController],
  exports: [ReviewService]
})
export class ReviewModule { }

