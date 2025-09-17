import { forwardRef, Module } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import { DatabaseModule } from '../../configs/database/database.module';
import { Provider } from './entities/provider.entity';
import { Student } from '../student/entities/student.entity';
import { Apartment } from '../apartment/entities/apartment.entity/apartment.entity';
import { PendingRequestModule } from '../request/pendingRequest.module';
import { Room } from '../room/entities/room.entity/room.entity';
import { RentalRequest } from '../booking-request/entity/rental-request.entity';
import { Bed } from '../bed/entities/bed.entity/bed.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DatabaseModule.forFeature([Provider, Student,Apartment,Room,Bed,RentalRequest]),
 forwardRef(() => PendingRequestModule),UserModule],
  exports: [ProviderService,DatabaseModule],
  controllers: [ProviderController],
  providers: [ProviderService],
})
export class ProviderModule { }
