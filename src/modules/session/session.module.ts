import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { DatabaseModule } from '../../configs/database/database.module';
import { SecurityGroup } from '../security-group/entities/security-group.entity';
import { Session } from './entities/session.entity';
import { FCMToken } from '../fcm-token/entities/fcm-token.entity';

@Module({
  imports: [DatabaseModule.forFeature([Session])],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
