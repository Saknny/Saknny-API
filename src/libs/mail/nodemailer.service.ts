const nodemailer = require('nodemailer');
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueueService } from '../queue/queue.service';
import { IMailService, MailDetails } from './mail.type';

@Injectable()
export class NodeMailerService implements IMailService {
  private from: any;
  private transporter: any;

  constructor(
    private readonly configService: ConfigService,
    private queueService: QueueService,
  ) {
    this.queueService.createQueue(
      'mail',
      undefined,
      this.processMailJob.bind(this),
    );

    const fromEnv =
      this.configService.get<string>('MAIL_ACCOUNT') ||
      'team@donatella-sa.com:prcjkvwtzshykhce';
    const fromDetails = (fromEnv || 'email:password').split(':');

    this.from = {
      mail: fromDetails[0],
      password: fromDetails[1],
    };

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      secureConnection: false,
      secure: false,
      port: 587,
      auth: {
        user: this.from.mail,
        pass: this.from.password,
      },
    });
  }

  public async send(input: MailDetails): Promise<void> {
    this.queueService.addToQueue('mail', { input });
    return;
  }

  private async processMailJob(job: any) {
    const input = job.data ? job.data.input : job.input;
    const { to, html, from, subject, attachments } = input;
    await this.transporter.sendMail({
      from: from || this.from.mail,
      to,
      subject,
      html,
      attachments: attachments || [],
    });
  }
}
