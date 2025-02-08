import { Injectable } from '@nestjs/common';
import { Session } from '@src/modules/session/entities/session.entity';
import { TokenPayload } from '@src/libs/types/auth-token-payload.type';
import { IContextAuthService } from './context-auth.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseHttpException } from '../exceptions/base-http-exception';
import { ErrorCodeEnum } from '../exceptions/error-code.enum';
import { SessionStatusEnum } from '../../../modules/session/enums/session.enum';
import { User } from '../../../modules/user/entities/user.entity';
import { Request } from 'express';
import { get } from 'env-var';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class ContextAuthService implements IContextAuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
  ) {}

  public hasPermission(permission: string, user: User): boolean {
    if (!user || !user.securityGroup || !user.securityGroup.id) return false;
    return user.securityGroup.permissions.includes(permission);
  }

  async getUserFromReqHeaders(req: Request): Promise<User> {
    let auth: string;
    if (req.headers.authorization) auth = req.headers.authorization;
    if (req.headers.Authorization) auth = <string>req.headers.Authorization;

    const token = auth.split('Bearer ')[1] || null;
    if (!token) return null;

    try {
      const secretOrKey = get('JWT_PUBLIC').asString();
      const payload = <TokenPayload>jwt.verify(token, secretOrKey);
      const { user } = await this.getUserAndSessionFromPayload(payload);

      await this.updateUserLastSeen(user);
      return user;
    } catch {
      throw new BaseHttpException(ErrorCodeEnum.UNAUTHORIZED);
    }
  }

  public async getUserAndSessionFromPayload(
    payload: TokenPayload,
  ): Promise<{ user: User; session: Session }> {
    if (!payload) return null;
    const { userId, sessionId } = payload;

    const user = await this.findAndValidateUser(userId);
    const session = await this.findSessionOrThrow(sessionId);

    await this.updateUserLastSeen(user);
    return { user, session };
  }

  private async findAndValidateUser(userId: string): Promise<User> {
    if (!userId) throw new BaseHttpException(ErrorCodeEnum.UNAUTHORIZED);
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['securityGroup', 'student', 'organization'],
    });

    if (!user) throw new BaseHttpException(ErrorCodeEnum.UNAUTHORIZED);
    else if (user.isBlocked)
      throw new BaseHttpException(ErrorCodeEnum.BLOCKED_USER);
    else if (!user.verifiedEmail)
      throw new BaseHttpException(ErrorCodeEnum.USER_IS_NOT_VERIFIED);
    else if (!user[`${user.role.toLowerCase()}`])
      throw new BaseHttpException(ErrorCodeEnum.USER_PROFILE_MiSSING);

    return user;
  }

  private async findSessionOrThrow(sessionId: string): Promise<Session> {
    if (!sessionId) throw new BaseHttpException(ErrorCodeEnum.UNAUTHORIZED);

    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, status: SessionStatusEnum.ACTIVE },
      relations: ['fcmToken'],
    });

    if (!session) throw new BaseHttpException(ErrorCodeEnum.UNAUTHORIZED);
    else return session;
  }

  private async updateUserLastSeen(user: User): Promise<void> {
    user.lastSeenAt = new Date();
    await this.userRepo.save(user);
  }
}
