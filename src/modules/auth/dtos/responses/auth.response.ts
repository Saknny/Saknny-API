import { Expose } from 'class-transformer';
import { UserResponse } from '../../../user/dtos/responses/user.response';

export class AuthResponse {
  @Expose()
  user: UserResponse;

  @Expose()
  token: string;
}
