import { Module } from '@nestjs/common';
import { OrganizationService } from './provider.service';
import { OrganizationController } from './provider.controller';
import { DatabaseModule } from '../../configs/database/database.module';
import { Provider } from './entities/provider.entity';
import { Student } from '../individual/entities/student.entity';

@Module({
  imports: [DatabaseModule.forFeature([Provider, Student])],
  controllers: [OrganizationController],
  providers: [OrganizationService],
})
export class ProviderModule {}
