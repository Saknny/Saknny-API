import { Module } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import { DatabaseModule } from '../../configs/database/database.module';
import { Provider } from './entities/provider.entity';
import { Student } from '../student/entities/student.entity';
import { Apartment } from '../apartment/entities/apartment.entity/apartment.entity';

@Module({
  imports: [DatabaseModule.forFeature([Provider, Student,Apartment])],
  exports: [ProviderService,DatabaseModule],
  controllers: [ProviderController],
  providers: [ProviderService],
})
export class ProviderModule { }
