import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectBaseRepository } from '../../../libs/decorators/inject-base-repository.decorator';
import { BaseRepository } from '../../../libs/types/base-repository';
import { Job } from '../entities/job.entity';
import { Organization } from '../../organization/entities/organization.entity';
import { CreateJobInput } from '../dtos/inputs/create-job.input';
import { Tag } from '../../tag/entities/tag.entity';
import { ErrorCodeEnum } from '../../../libs/application/exceptions/error-code.enum';
import { FilterJobsInput } from '../dtos/inputs/filter-job.input';
import { PaginatorInput } from '../../../libs/application/paginator/paginator.input';
import { dataSource } from '../../../configs/database/postgres.config';
import { JobTransformer } from '../transformer/job.transformer';
import { Review } from '../entities/review.entity';
import { Individual } from '../../individual/entities/individual.entity';
import { JobStatusEnum } from '../enums/job.enum';
import { ILike } from 'typeorm';

@Injectable()
export class JobService {
  constructor(
    private readonly jobTransformer: JobTransformer,
    @InjectBaseRepository(Tag)
    private readonly tagRepo: BaseRepository<Tag>,
    @InjectBaseRepository(Job)
    private readonly jobRepo: BaseRepository<Job>,
    @InjectBaseRepository(Review)
    private readonly reviewRepo: BaseRepository<Review>,
  ) {}

  async searchJobs(
    jobFilterInput: FilterJobsInput,
    { page, limit }: PaginatorInput,
  ) {
    const { jobCategory, searchKey } = jobFilterInput;

    const searchConfig = 'english';
    const jobSearchVector = 'job.jobSearchVector';

    let modifiedSearchTerm = '';
    if (searchKey) {
      const words = searchKey.split(/\s+/);
      const similarWords = [];
      const defaultThreshold = 0.3;
      const thresholdDecrement = 0.05;

      for (const word of words) {
        let threshold = defaultThreshold;
        let result = [];

        do {
          result = await dataSource
            .createQueryBuilder()
            .select('lexeme.word, similarity(lexeme.word, :word) AS similarity')
            .from('job_unique_words', 'lexeme')
            .where('similarity(lexeme.word, :word) > :threshold', {
              word,
              threshold,
            })
            .orderBy('similarity', 'DESC')
            .limit(5)
            .getRawMany();

          if (words.length === 1 && result.length === 0) {
            threshold -= thresholdDecrement;
          }
        } while (words.length === 1 && result.length === 0 && threshold >= 0);

        if (result.length > 0) {
          similarWords.push(
            result[0].similarity > 0.5 ? result.slice(0, 1) : result,
          );
        }
      }

      modifiedSearchTerm = similarWords
        .map(
          (wordGroup) => `(${wordGroup.map((word) => word.word).join(' | ')})`,
        )
        .join(' & ');
    }

    const queryBuilder = dataSource
      .createQueryBuilder()
      .select([
        'job.id AS id',
        'job.title  AS title',
        'job.location AS location',
        'job.salary AS salary',
        'job.jobDuration AS "jobDuration"',
        'job.createdAt AS "createdAt"',
        'organization.name AS "organization_name"',
        'organization.logo AS "organization_logo"',
        'tags.title AS "tags_title"',
      ])
      .from('job', 'job')
      .leftJoin('job.organization', 'organization')
      .leftJoin('job.tags', 'tags')
      .where('job.jobStatus = :jobStatus', { jobStatus: 'OPEN' })
      .andWhere('job.jobCategory = :jobCategory', { jobCategory });

    if (searchKey) {
      queryBuilder
        .andWhere(
          `${jobSearchVector} @@ to_tsquery(:searchConfig, :searchTerm)`,
        )
        .setParameters({ searchTerm: modifiedSearchTerm, searchConfig });
    }

    const skip = (page - 1) * limit;
    const rawResults = await queryBuilder.skip(skip).take(limit).getRawMany();
    const items = this.jobTransformer.transformJobData(rawResults);

    const total = await queryBuilder.getCount();

    return {
      items,
      pageInfo: {
        page,
        limit,
        hasBefore: page > 1,
        hasNext: skip + items.length < total,
        totalCount: total,
      },
    };
  }

  async getJob(jobId: string) {
    const job = await this.jobRepo.findOneOrError(
      { id: jobId },
      ErrorCodeEnum.NOT_FOUND,
      { tags: true, organization: true },
    );

    const organizationWithUserId = {
      ...job.organization,
      id: job.organization.userId,
    };

    return { ...job, organization: organizationWithUserId };
  }

  async createJob(organization: Organization, createJobDto: CreateJobInput) {
    const tags = await this.tagRepo.findAllIdsOrError(
      createJobDto.tags,
      { isApproved: true },
      ErrorCodeEnum.TAG_NOT_FOUND,
    );

    await this.jobRepo.createOne({
      ...createJobDto,
      organization,
      tags,
    });
  }

  async acceptJob(jobId: string, individualId: string) {
    const job = await this.jobRepo.findOneOrError(
      { id: jobId },
      ErrorCodeEnum.NOT_FOUND,
    );

    if (job.jobStatus !== JobStatusEnum.OPEN) {
      throw new BadRequestException('Job is not open for acceptance');
    }

    job.jobStatus = JobStatusEnum.ACCEPTED;
    job.individual = { id: individualId } as Individual;
    await this.jobRepo.save(job);

    return job;
  }

  async finishJob(jobId: string) {
    const job = await this.jobRepo.findOneOrError(
      { id: jobId },
      ErrorCodeEnum.NOT_FOUND,
    );

    if (job.jobStatus !== JobStatusEnum.ACCEPTED) {
      throw new BadRequestException('Job is not accepted');
    }

    job.jobStatus = JobStatusEnum.FINISHED;
    await this.jobRepo.save(job);

    return job;
  }

  async createReview(jobId: string, reviewerId: string, rating: number, comment: string) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const job = await this.jobRepo.findOneOrError(
      { id: jobId },
      ErrorCodeEnum.NOT_FOUND,
    );

    if (job.jobStatus !== JobStatusEnum['FINISHED']) {
      throw new BadRequestException('Job is not finished');
    }

    const review = this.reviewRepo.create({
      rating,
      comment,
      job: { id: jobId } as Job,
      reviewer: { id: reviewerId } as Individual,
    });

    await this.reviewRepo.save(review);

    return review;
  }
}
