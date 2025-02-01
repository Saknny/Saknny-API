import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { DatabaseModule } from '../../configs/database/database.module';
import { Otp } from './entities/otp.entity';
import { User } from '../user/entities/user.entity';
import { MailModule } from '../../libs/mail/mail.module';

@Module({
  imports: [DatabaseModule.forFeature([Otp, User]), MailModule],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
