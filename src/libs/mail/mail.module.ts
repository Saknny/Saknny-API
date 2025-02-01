import { BullModule } from '@nestjs/bull';
import { MailService } from './mail.service';
import { Module, Global } from '@nestjs/common';
import { NodeMailerService } from './nodemailer.service';

@Global()
@Module({
  imports: [BullModule.registerQueue({ name: 'mail' })],
  providers: [MailService, NodeMailerService],
  exports: [MailService, NodeMailerService],
})
export class MailModule {}
