import * as fs from 'fs';
import * as path from 'path';
import { Response, Request } from 'express';
import { PaymentService } from './payment.service';
import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { CreateCheckoutInput } from './dtos/inputs/create-checkout.input';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  async getPayments() {
    return this.paymentService.getAllPayments();
  }

  @Get('iframe/:checkoutId/url')
  async getIframeUrl(
    @Param('checkoutId') checkoutId: string,
    @Req() req: Request,
  ): Promise<string> {
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}/api/v1/payments/iframe/${checkoutId}`;
  }

  @Get('iframe/:checkoutId')
  async getIframe(
    @Param('checkoutId') checkoutId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const filePath = path.join(process.cwd(), 'static/payment.html');
    const htmlTemplate = fs.readFileSync(filePath, 'utf8');

    const protocol = req.protocol;
    const host = req.get('host');
    const apiPrefix = 'api/v1';
    const requiredUrl = `${protocol}://${host}/${apiPrefix}/payments/status/${checkoutId}`;

    const renderedHtml = htmlTemplate
      .replace('{{checkoutId}}', checkoutId)
      .replace('{{URL}}', `${protocol}://${host}`)
      .replace('{{API_PREFIX}}', apiPrefix)
      .replace('{shopperResultUrl}', requiredUrl);

    res.setHeader('Content-Type', 'text/html');
    return res.send(renderedHtml);
  }

  @Get('status/:checkoutId')
  async getCheckoutStatus(@Param('checkoutId') checkoutId: string) {
    return this.paymentService.getPaymentStatus(checkoutId);
  }

  @Post('checkout')
  async createCheckout(@Body() Input: CreateCheckoutInput) {
    return this.paymentService.createCheckout(Input);
  }
}
