import { Body, Controller, Get, Headers, Post, Query, Req, Res } from '@nestjs/common';
import { StripeWebhookService } from './stripe-webhook.service';

@Controller('payment')
export class PaymentController {
    constructor(private readonly stripeWebhookService: StripeWebhookService) { }


    @Post('webhook')
    async handleWebhook(@Req() req: Request, @Headers('stripe-signature') sig: string) {

        if (!(req.body instanceof Buffer)) {
            throw new Error("req.body is not a Buffer! Make sure bodyParser.raw() is applied first.");
        }
    
        await this.stripeWebhookService.handleWebhook(req.body, sig);
    }


  @Get('success')
  async paymentSuccess() {

    return {
      status: 'success',
      message: 'Payment completed successfully',
    };
  }

  @Get('fail')
  async paymentFail() {
    return {
      status: 'failed',
      message: 'Payment was cancelled or failed',
    };
  }
}
    
