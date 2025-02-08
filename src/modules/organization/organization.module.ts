import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { DatabaseModule } from '../../configs/database/database.module';
import { Organization } from './entities/organization.entity';
import { Student } from '../individual/entities/student.entity';

@Module({
  imports: [DatabaseModule.forFeature([Organization, Student])],
  controllers: [OrganizationController],
  providers: [OrganizationService],
})
export class OrganizationModule {}
