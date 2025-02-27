import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity/payment.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeWebhookService {
    private stripe: Stripe;

    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepo: Repository<Payment>,
        private readonly configService: ConfigService
    ) {
        this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
            apiVersion: null,
        });
    }

    async handleWebhook(payload: any, sig: string) {
        console.log('🔔 Webhook received:', payload);
        const endpointSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
        let event: Stripe.Event;
        
        try {
            event = this.stripe.webhooks.constructEvent(payload, sig, endpointSecret);
            console.log(event.id);
        } catch (err) {
            throw new Error(`Webhook error: ${err.message}`);
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const subscriptionId = session.metadata.subscriptionId;
            console.log(subscriptionId);
            await this.paymentRepo.update({ subscription: { id: subscriptionId } }, { status: 'Paid' });
        }
    }
}
