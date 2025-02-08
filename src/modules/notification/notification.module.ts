import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { DatabaseModule } from '../../configs/database/database.module';
import { FCMTokenModule } from '../fcm-token/fcm-token.module';
import { Notification } from './entities/notification.entity';
import { NotificationStatus } from './entities/notificationStatus.entity';
import { BullModule } from '@nestjs/bull';
import { Student } from '../individual/entities/student.entity';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification',
    }),
    DatabaseModule.forFeature([Student, Notification, NotificationStatus]),
    FCMTokenModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
