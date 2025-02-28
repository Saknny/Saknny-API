import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor(private readonly configService: ConfigService) {
        this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
            apiVersion: '2025-02-24.acacia',
        });
    }

  // stripe.service.ts

async createCheckoutSession(amount: number, subscriptionId: string, paymentId: string) {
    const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Subscription Plan',
                    },
                    unit_amount: amount * 100,
                },
                quantity: 1,
            },
        ],
        metadata: {
            subscriptionId,
            paymentId
        },
        payment_intent_data: {
            metadata: {
                subscriptionId,
                paymentId
            }
        },
        success_url: this.configService.get<string>('STRIPE_SUCCESS_URL'),
        cancel_url: this.configService.get<string>('STRIPE_CANCEL_URL'),
    });
    return session;
}
}
