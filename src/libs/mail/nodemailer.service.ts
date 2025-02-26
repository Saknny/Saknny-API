import { Config } from '@src/configs/app/system.config';
import { QueueService } from '../queue/queue.service';
import { MailerConfigType } from '@libs/types/system.config';
import { Injectable } from '@nestjs/common';
import { IMailService, MailDetails } from './mail.type';
const nodemailer = require('nodemailer');

@Injectable()
export class NodeMailerService implements IMailService {
  private from: {
    mail: string;
    password: string;
  };
  private transporter: any;

  constructor(private readonly queueService: QueueService) {
    this.queueService.createQueue(
      'mailJob',
      undefined,
      this.processMailJop.bind(this),
    );

    const mailConfig = process.env.MAIL_ACCOUNT.split(':');

    console.log('mailConfig ---------------->', mailConfig);

    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: mailConfig[0],
        pass: mailConfig[1],
      },
    });
  }

  public async send(input: MailDetails): Promise<void> {
    this.queueService.addToQueue('mailJob', { input });
  }

  private async processMailJop(
    job: { input: MailDetails } & { data: { input: MailDetails } },
  ) {
    const input = job.data ? job.data.input : job.input;
    const { to, subject, html } = input;
    try {
      const info = await this.transporter.sendMail({
        to,
        subject,
        html,
        from: process.env.MAIL,
      });
      console.log(`Email sent: ${info.messageId}`);
    } catch (err) {
      console.error('Email sending failed:', err);
      throw err;
    }
  }
}
