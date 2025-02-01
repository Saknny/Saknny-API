import { Injectable } from '@nestjs/common';
import { JobShortResponse } from '../dtos/responses/jobs.response';
import { OrganizationShortInfo } from '../../organization/dtos/responses/organization.response';

@Injectable()
export class JobTransformer {
  constructor() {}

  transformJobData(rawData: any[]): JobShortResponse[] {
    const jobMap = new Map<string, JobShortResponse>();

    rawData.forEach((result) => {
      let job = jobMap.get(result.id);

      if (!job) {
        job = new JobShortResponse();
        job.id = result.id;
        job.title = result.title;
        job.location = result.location;
        job.salary = result.salary;
        job.jobDuration = result.jobDuration;
        job.createdAt = result.createdAt;
        job.organization = new OrganizationShortInfo();
        job.organization.name = result.organization_name;
        job.organization.logo = result.organization_logo;
        job.tags = [];

        jobMap.set(result.id, job);
      }

      if (result.tags_title && !job.tags.includes(result.tags_title)) {
        job.tags.push(result.tags_title);
      }
    });

    return Array.from(jobMap.values());
  }
}
