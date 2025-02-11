import { Module } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import { DatabaseModule } from '../../configs/database/database.module';
import { Provider } from './entities/provider.entity';
import { Student } from '../individual/entities/student.entity';

@Module({
  imports: [DatabaseModule.forFeature([Provider, Student])],
  exports: [ProviderService],
  controllers: [ProviderController],
  providers: [ProviderService],
})
export class ProviderModule { }
