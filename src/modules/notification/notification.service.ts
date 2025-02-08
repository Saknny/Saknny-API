import { Injectable } from '@nestjs/common';

import * as firebase from 'firebase-admin';
import { InjectBaseRepository } from '../../libs/decorators/inject-base-repository.decorator';
import { FCMToken } from '../fcm-token/entities/fcm-token.entity';
import { BaseRepository } from '../../libs/types/base-repository';
import { currentUserType } from '../../libs/types/current-user.type';
import { FCMTokenInput } from '../fcm-token/dtos/inputs/fcm-token.input';
import { FCMService } from '../fcm-token/fcm-token.service';
import { QueueService } from '../../libs/queue/queue.service';
import { Student } from '../individual/entities/student.entity';
import { NotificationTypeEnum } from './enums/notification.enum';
import { Notification } from './entities/notification.entity';
import { NotificationMessage } from './types/notification.type';
import { User } from '../user/entities/user.entity';

@Injectable()
export class NotificationService {
  constructor(
    private readonly fcmService: FCMService,
    private readonly queueService: QueueService,
    @InjectBaseRepository(Student)
    private readonly studentRepo: BaseRepository<Student>,
    @InjectBaseRepository(Notification)
    private readonly notificationRepo: BaseRepository<Notification>,
  ) {
    this.initializeFirebase();
    this.queueService.createQueue(
      'notification',
      undefined,
      this.processNotificationJob.bind(this),
    );
  }

  private initializeFirebase() {
    // firebase.initializeApp({
    //   credential: firebase.credential.cert(
    //     path.join(
    //       __dirname,
    //       '..',
    //       '..',
    //       '..',
    //       '..',
    //       'r-u-o-k-3cdb5-firebase-adminsdk-8oe8h-8d033da6c1.json',
    //     ),
    //   ),
    // });
  }

  async enableNotification(
    user: currentUserType,
    notificationDto: FCMTokenInput,
  ) {
    await this.fcmService.acceptPushNotification(
      user.id,
      user.session.id,
      notificationDto,
    );
  }

  async disableNotification(user: currentUserType) {
    await this.fcmService.disablePushNotification(user.id, user.session.id);
  }

  private async processNotificationJob(job: any) {
    // const { type, inputData }: NotificationJob = job.data || job;
    // switch (type) {
    //   case NotificationTypeEnum.CONNECT_MESSAGE:
    //     await this.processConnectMessage(inputData, type);
    //     break;
    //   default:
    //     console.warn('Unknown notification type');
    // }
  }

  private async processConnectMessage(data: any, type: NotificationTypeEnum) {
    // const tokens = await this.fcmService.getActiveNotificationToken();
    // if (!tokens.length) return;
    // const { title, body } = this.createMessage(type);
    // await this.sendNotification(tokens, title, body, user, friend, type);
  }

  private createMessage(type: NotificationTypeEnum): NotificationMessage {
    switch (type) {
      default:
        return {
          title: 'Spread the Love',
          body: `Take a moment to remind your loved ones how much they mean to you. They deserve to feel your warmth today!`,
        };
    }
  }

  private async sendNotification(
    fcmToken: FCMToken,
    title: string,
    body: string,
    sender: User,
    receiver: User,
    type: NotificationTypeEnum,
  ) {
    await this.notificationRepo.createOne({
      fcmToken,
      type,
      enTitle: title,
      enBody: body,
      sender,
      receiver,
    });

    await firebase
      .messaging()
      .send({
        notification: { title, body },
        token: fcmToken.fcmTokenString,
        android: { priority: 'high' },
      })
      .catch((error: any) => {
        console.error('Failed to send notification:', error);
      });
  }
}
