import { Injectable } from '@nestjs/common';
import { FCMTokenInput } from './types/fcm-token.Types';
import { InjectBaseRepository } from '../../libs/decorators/inject-base-repository.decorator';
import { FCMToken } from './entities/fcm-token.entity';
import { BaseRepository } from '../../libs/types/base-repository';

import { FCMTokenStatusEnum } from './enums/fcm-token.enum';

@Injectable()
export class FCMService {
  constructor(
    @InjectBaseRepository(FCMToken)
    private readonly fcmTokenRepo: BaseRepository<FCMToken>,
  ) {}

  async acceptPushNotification(
    userId: string,
    sessionId: string,
    fcmTokenInput: FCMTokenInput,
  ): Promise<void> {
    const existingToken = await this.fcmTokenRepo.findOne({
      session: { id: sessionId },
    });

    if (existingToken) {
      await this.fcmTokenRepo.updateOneFromExistingModel(existingToken, {
        ...fcmTokenInput,
        status: FCMTokenStatusEnum.ACTIVE,
      });
    } else {
      await this.fcmTokenRepo.createOne({
        ...fcmTokenInput,
        user: { id: userId },
        session: { id: sessionId },
      });
    }
  }

  async disablePushNotification(
    userId: string,
    sessionId: string,
  ): Promise<void> {
    const existingToken = await this.fcmTokenRepo.findOne({
      user: { id: userId },
      session: { id: sessionId },
    });

    if (!existingToken) return;
    await this.fcmTokenRepo.updateOneFromExistingModel(existingToken, {
      status: FCMTokenStatusEnum.INACTIVE,
    });
  }

  async getActiveNotificationToken(userId: string) {
    return this.fcmTokenRepo.findAll({
      user: { id: userId },
      status: FCMTokenStatusEnum.ACTIVE,
    });
  }
}
