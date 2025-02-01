import { PaginationRes } from '../application/paginator/paginator.types';

export interface SuccessResponse<T> {
  code: number;
  success: boolean;
  message: string;
  data: T | PaginationRes<T>;
}

export interface ErrorResponse {
  code: number;
  success: boolean;
  message: string;
}
