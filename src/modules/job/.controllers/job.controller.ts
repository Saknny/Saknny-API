import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JobService } from '../.services/job.service';
import { CreateJobInput } from '../dtos/inputs/create-job.input';
import { JwtAuthenticationGuard } from '../../../libs/guards/strategy.guards/jwt.guard';
import { currentUser } from '../../../libs/decorators/currentUser.decorator';
import { Organization } from '../../organization/entities/organization.entity';
import { Auth } from '../../../libs/decorators/auth.decorator';
import { FilterJobsInput, JobIdInput } from '../dtos/inputs/filter-job.input';
import { PaginatorInput } from '../../../libs/application/paginator/paginator.input';
import { Serialize } from '../../../libs/interceptors/serialize.interceptor';
import { PaginatorResponse } from '../../../libs/application/paginator/paginator.response';
import {
  JobFullResponse,
  JobShortResponse,
} from '../dtos/responses/jobs.response';
import { CreateReviewInput } from '../dtos/inputs/create-review.input';
import { ReviewResponse } from '../dtos/responses/review.response';

@Controller('jobs')
@UseGuards(JwtAuthenticationGuard)
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get()
  @Auth({ allow: 'individual' })
  @Serialize(PaginatorResponse, JobShortResponse)
  async geJobs(
    @Query('filter') jobFilterInput: FilterJobsInput,
    @Query('paginate') paginate: PaginatorInput,
  ) {
    if (!paginate) paginate = { page: 1, limit: 15 };
    return await this.jobService.searchJobs(jobFilterInput, paginate);
  }

  @Get('/:jobId')
  @Auth({ allow: 'individual' })
  @Serialize(JobFullResponse)
  async getJob(@Param() { jobId }: JobIdInput) {
    return await this.jobService.getJob(jobId);
  }

  @Post()
  @Auth({ allow: 'organization' })
  async createJob(
    @currentUser('organization') organization: Organization,
    @Body() createJobDto: CreateJobInput,
  ) {
    return await this.jobService.createJob(organization, createJobDto);
  }

  @Post('/:jobId/accept')
  @Auth({ allow: 'individual' })
  @Serialize(JobFullResponse)
  async acceptJob(
    @Param() { jobId }: JobIdInput,
    @currentUser('individual') individual: any, 
  ) {
    return this.jobService.acceptJob(jobId, individual.id);
  }

  @Post('/:jobId/finish')
  @Auth({ allow: 'individual' })
  @Serialize(JobFullResponse)
  async finishJob(@Param() { jobId }: JobIdInput) {
    return this.jobService.finishJob(jobId);
  }

  @Post('/:jobId/reviews')
  @Auth({ allow: 'individual' })
  @Serialize(ReviewResponse)
  async createReview(
    @Param() { jobId }: JobIdInput,
    @currentUser('individual') reviewer: any,
    @Body() createReviewDto: CreateReviewInput,
  ) {
    return this.jobService.createReview(
      jobId,
      reviewer.id,
      createReviewDto.rating,
      createReviewDto.comment,
    );
  }
}
