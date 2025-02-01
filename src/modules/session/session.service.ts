import { Injectable } from '@nestjs/common';
import { InjectBaseRepository } from '../../libs/decorators/inject-base-repository.decorator';
import { BaseRepository } from '../../libs/types/base-repository';
import { Session } from './entities/session.entity';
import { FCMToken } from '../fcm-token/entities/fcm-token.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectBaseRepository(Session)
    private readonly SessionRepo: BaseRepository<Session>,
  ) {}

  async create(user: User, fcmToken?: FCMToken) {
    return this.SessionRepo.createOne({
      user,
      ...(fcmToken ? { fcmToken } : {}),
    });
  }

  async remove(session: Session): Promise<void> {
    await this.SessionRepo.delete({ id: session.id });
  }
}
