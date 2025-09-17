import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { currentUser } from '@src/libs/decorators/currentUser.decorator';
import { JwtAuthenticationGuard } from '@src/libs/guards/strategy.guards/jwt.guard';
import { currentUserType } from '@src/libs/types/current-user.type';
import { NotificationService } from './notification.service';

@Controller('notifications')
@UseGuards(JwtAuthenticationGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(@currentUser() user: currentUserType) {
    return this.notificationService.getUserNotifications(user.id);
  }

  @Patch(':id/read')
  async markNotificationRead(@Param('id') id: string) {
    await this.notificationService.markAsRead(id);
    return { message: 'Notification marked as read' };
  }
}

