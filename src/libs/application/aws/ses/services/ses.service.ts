import {
  SendEmailCommand,
  SendEmailCommandInput,
  SendEmailCommandOutput,
  SESClient,
} from '@aws-sdk/client-ses';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SesService {
  constructor() {}
  async sendSimpleEmail(
    client: SESClient,
    from: string,
    to: string | string[],
    subject: string,
    body: { htmlBody?: string; textBody?: string },
  ): Promise<SendEmailCommandOutput> {
    if (body.htmlBody && body.textBody) {
      throw new Error('Only one of htmlBody or textBody can be provided');
    }
    const emailParams: SendEmailCommandInput = {
      Source: from,
      Destination: {
        ToAddresses: Array.isArray(to) ? to : [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          ...(body.htmlBody && {
            Html: {
              Data: body.htmlBody,
              Charset: 'UTF-8',
            },
          }),
          ...(body.textBody && {
            Text: {
              Data: body.textBody,
              Charset: 'UTF-8',
            },
          }),
        },
      },
    };

    try {
      const response = await client.send(new SendEmailCommand(emailParams));
      console.log('Email sent successfully:', response);
      return response;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
