import { Expose } from 'class-transformer';

export class GetTagResponse {
  @Expose()
  id: string;

  @Expose()
  title: string;
}
