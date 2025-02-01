import { TokenPayload } from '../../types/auth-token-payload.type';
import { Session } from '../../../modules/session/entities/session.entity';
import { User } from '../../../modules/user/entities/user.entity';
import { Request } from 'express';

export const IContextAuthServiceToken = 'IContextAuthService';

export interface IContextAuthService {
  getUserAndSessionFromPayload(
    payload: TokenPayload,
  ): Promise<{ user: User; session: Session }>;

  getUserFromReqHeaders(req: Request): Promise<User>;

  hasPermission(permission: string, user: User): boolean;
}
