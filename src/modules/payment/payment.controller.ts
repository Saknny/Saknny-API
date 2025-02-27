import { Controller, Headers, Post, Req } from '@nestjs/common';
import { StripeWebhookService } from './stripe-webhook.service';

@Controller('payment')
export class PaymentController {
    constructor(private readonly stripeWebhookService: StripeWebhookService){}


    @Post('webhook')
    async handleWebhook(@Req() req, @Headers('stripe-signature') sig: string) {
        console.log('🔔 Webhook request received:', req.body); // Log full request body
        console.log('🔔 Stripe signature:', sig); // Log signature
        await this.stripeWebhookService.handleWebhook(req.body, sig);
    }
}
