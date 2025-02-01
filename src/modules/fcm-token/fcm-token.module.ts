import { Module } from '@nestjs/common';
import { FCMService } from './fcm-token.service';
import { DatabaseModule } from '../../configs/database/database.module';
import { FCMToken } from './entities/fcm-token.entity';

@Module({
  imports: [DatabaseModule.forFeature([FCMToken])],
  controllers: [],
  providers: [FCMService],
  exports: [FCMService],
})
export class FCMTokenModule {}
