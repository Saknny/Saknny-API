import { Expose } from 'class-transformer';

export class PageInfoResponse {
  @Expose()
  page: number;

  @Expose()
  limit: number;

  @Expose()
  hasBefore: boolean;

  @Expose()
  hasNext: boolean;

  @Expose()
  totalCount: number;
}

export class PaginatorResponse<T> {
  @Expose()
  items: T[];

  @Expose()
  pageInfo: PageInfoResponse;
}

class CursorBasedPageInfoResponse {
  @Expose()
  cursor: string;

  @Expose()
  direction: string;

  @Expose()
  limit: number;

  @Expose()
  hasBefore: boolean;

  @Expose()
  hasNext: boolean;

  @Expose()
  totalCount: number;
}

export class CursorBasedPaginatorResponse<T> {
  @Expose()
  items: T[];

  @Expose()
  pageInfo: CursorBasedPageInfoResponse;
}
