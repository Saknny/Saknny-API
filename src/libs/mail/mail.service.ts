import { Injectable } from '@nestjs/common';
import { IMailService, MailDetails, mjmlType } from './mail.type';
import { NodeMailerService } from './nodemailer.service';
import { readFile, readdir } from 'fs/promises';
import * as Handlebars from 'handlebars';
import * as mjml2html from 'mjml';
import * as path from 'path';

@Injectable()
export class MailService implements IMailService {
  private mailService: IMailService;

  constructor(private nodeMailerService: NodeMailerService) {
    this.mailService = this.nodeMailerService;
  }

  public async send(input: MailDetails) {
    const templatePath = path.join(
      process.cwd(),
      'public',
      'templates',
      input.mjml.template,
      'body.hbs',
    );

    await this.mailService.send({
      ...input,
      html: await this.handleTemplate(input.mjml, templatePath),
    });
  }

  private async registerPartialsToHbs(partialSource: string): Promise<void> {
    for (const filePath of await readdir(partialSource, 'utf8')) {
      const partialName = path.basename(filePath, '.hbs');
      const file = await readFile(path.join(partialSource, filePath), 'utf8');
      await new Promise((res, rej) => {
        try {
          Handlebars.registerPartial(partialName, file);
          res(null);
        } catch (err) {
          rej(err);
        }
      });
    }
  }

  async handleTemplate(
    input: mjmlType,
    source: string,
    partialSource: string = `${process.cwd()}/public/templates/partials`,
  ): Promise<string> {
    await this.registerPartialsToHbs(partialSource);

    const templateFile = await readFile(source, 'utf8');
    try {
      const page = Handlebars.compile(templateFile);
      const output = page({ data: input });
      const html = mjml2html(output).html;
      return html;
    } catch (err) {
      throw err;
    }
  }
}
