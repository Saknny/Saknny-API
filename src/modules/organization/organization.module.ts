import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { DatabaseModule } from '../../configs/database/database.module';
import { Organization } from './entities/organization.entity';
import { Job } from '../../modules/job/entities/job.entity';
import { Individual } from '../../modules/individual/entities/individual.entity';
import { Review } from '../../modules/job/entities/review.entity';

@Module({
  imports: [DatabaseModule.forFeature([
    Organization,
    Job,
    Individual,
    Review
  ])],
  controllers: [OrganizationController],
  providers: [OrganizationService],
})
export class OrganizationModule {}
