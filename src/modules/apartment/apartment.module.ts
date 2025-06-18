import { forwardRef, Module } from '@nestjs/common';
import { ApartmentService } from './apartment.service';
import { ApartmentController } from './apartment.controller';
import { DatabaseModule } from '@src/configs/database/database.module';
import { Apartment } from './entities/apartment.entity/apartment.entity';
import { Room } from '../room/entities/room.entity/room.entity';
import { Bed } from '../bed/entities/bed.entity/bed.entity';
import { ProviderModule } from '../provider/provider.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PendingRequestModule } from '../request/pendingRequest.module';
import { Provider } from '../provider/entities/provider.entity';
import { ApartmentDocument } from './entities/document.entity';
import { ProviderSubscriptionModule } from '../provider-subscription/provider-subscription.module';
import { Student } from '../student/entities/student.entity';
import { Image } from '../image/image.entity';
import { FavoriteApartment } from '../favoriteList/entities/favorite-apartment.entity';
import { SubscriptionPlanService } from '../subscription-plan/subscription-plan.service';
import { SubscriptionPlanModule } from '../subscription-plan/subscription-plan.module';

@Module({
  imports: [
    DatabaseModule.forFeature([
      Apartment,
      Room,
      Bed,
      Provider,
      ApartmentDocument,
      Student,
      FavoriteApartment,
      
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // Ensure this path exists
      serveRoot: '/', // This means the files will be served at the root URL
      exclude: ['/api*'], // Exclude API routes from static serving
    }),
    forwardRef(() => PendingRequestModule),
    SubscriptionPlanModule,
    ProviderSubscriptionModule,
  ],

  providers: [ApartmentService],
  controllers: [ApartmentController],
  exports: [ApartmentService],
})
export class ApartmentModule {}
