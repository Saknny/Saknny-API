import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '@src/libs/types/base-repository';
import { Notification } from './entities/notification.entity/notification.entity';
import { NotificationStatus } from './enums/notificationStatus.enum';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: BaseRepository<Notification>,
  ) {}

  async createNotification(data: {
    userId: string;
    type: string;
    message: string;
    relatedEntityId?: string;
  }) {
    const notification = this.notificationRepo.create({
      ...data,
      status: NotificationStatus.UNREAD,
    });
    return this.notificationRepo.save(notification);
  }

  async getUserNotifications(userId: string) {
    return this.notificationRepo
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC')
      .getMany();
  }

  async markAsRead(id: string) {
    await this.notificationRepo.update(
      { id },
      { status: NotificationStatus.READ }
    );
  }
}