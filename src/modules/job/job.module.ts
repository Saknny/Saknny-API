import { Module } from '@nestjs/common';
import { JobService } from './.services/job.service';
import { JobController } from './.controllers/job.controller';
import { DatabaseModule } from '../../configs/database/database.module';
import { JobCategory } from './entities/job_category.entity';
import { Job } from './entities/job.entity';
import { Tag } from '../tag/entities/tag.entity';
import { JobTransformer } from './transformer/job.transformer';
import { Individual } from '../../modules/individual/entities/individual.entity';
import { Review } from './entities/review.entity';
import { Organization } from '../../modules/organization/entities/organization.entity';
@Module({
  imports: [DatabaseModule.forFeature([
    Job, 
    JobCategory, 
    Tag,
    Individual,
    Review,
    Organization
  ])],
  controllers: [JobController],
  providers: [JobService, JobTransformer],
})
export class JobModule {}
