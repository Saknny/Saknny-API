import { Expose, Type } from 'class-transformer';
import { JobShortResponse } from '../responses/jobs.response'; // استيراد من مجلد dtos
import { IndividualShortInfo } from '../../../individual/dtos/responses/individual.response';

export class ReviewResponse {
  @Expose()
  id: string;

  @Expose()
  rating: number;

  @Expose()
  comment: string;

  @Expose()
  @Type(() => JobShortResponse)
  job: JobShortResponse;

  @Expose()
  @Type(() => IndividualShortInfo)
  reviewer: IndividualShortInfo;

  @Expose()
  createdAt: Date;
}