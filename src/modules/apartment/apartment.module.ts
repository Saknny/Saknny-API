import { forwardRef, Module } from '@nestjs/common';
import { ApartmentService } from './apartment.service';
import { ApartmentController } from './apartment.controller';
import { DatabaseModule } from '@src/configs/database/database.module';
import { Apartment } from './entities/apartment.entity/apartment.entity';
import { Room } from '../room/entities/room.entity/room.entity';
import { Bed } from '../bed/entities/bed.entity/bed.entity';
import { ProviderModule } from '../provider/provider.module';
import { ApartmentImage } from './entities/apartmentImage.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PendingRequestModule } from '../request/pendingRequest.module';

@Module({
  imports: [DatabaseModule.forFeature([Apartment, Room, Bed, ApartmentImage
  ])
    , ProviderModule
    , ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // Ensure this path exists
      serveRoot: '/', // This means the files will be served at the root URL
      exclude: ['/api*'], // Exclude API routes from static serving
    }),
  forwardRef(() => PendingRequestModule)],
  providers: [ApartmentService],
  controllers: [ApartmentController],
  exports: [ApartmentService]

})
export class ApartmentModule { }
