import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity/payment.entity';
import { ConfigService } from '@nestjs/config';
import { ProviderSubscription } from '../provider-subscription/provider-subscription.entity/provider-subscription.entity';

@Injectable()
export class StripeWebhookService {
    private stripe: Stripe;

    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepo: Repository<Payment>,
        @InjectRepository(ProviderSubscription)
        private readonly providerSubscription: Repository<ProviderSubscription>,
        private readonly configService: ConfigService

    ) {
        this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
            apiVersion: null,
        });
    }

    async handleWebhook(payload: Buffer, sig: string) {
        const endpointSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(payload, sig, endpointSecret);
        } catch (err) {
            console.error("🚨 Webhook Error:", err);
            return { statusCode: 400, message: `Webhook signature verification failed: ${err.message}` };
        }

        console.log('🔔 Event Type:', event.type);

        // Handle successful checkout session
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            console.log('checkout Session.................');
            if (!session.metadata || !session.metadata.paymentId) {
                return { statusCode: 400, message: "PaymentId is missing from metadata!" };
            }

            const paymentId = session.metadata.paymentId;
            const subscriptionId = session.metadata.subscriptionId;
            try {
                await this.paymentRepo.update({ id: paymentId }, { status: 'Paid' });
                await this.providerSubscription.update({ id: subscriptionId }, { isActive: true });
            } catch (dbError) {
                return { statusCode: 500, message: "Database error: Failed to update payment status." };
            }
        }
        else if (event.type === 'payment_intent.payment_failed') {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            console.log('💥 Payment Failed Intent.................');

            if (!paymentIntent.metadata?.paymentId) {
                return { statusCode: 400, message: "PaymentId is missing from metadata!" };
            }

            try {
                await this.paymentRepo.update(
                    { id: paymentIntent.metadata.paymentId },
                    { status: 'Failed' }
                );
            } catch (dbError) {
                return {
                    statusCode: 500,
                    message: "Database error: Failed to update payment status to Failed."
                };
            }
        }


    }
}        