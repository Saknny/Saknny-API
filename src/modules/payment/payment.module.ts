import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity/payment.entity';
import { StripeWebhookService } from './stripe-webhook.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  controllers: [PaymentController],
  providers: [StripeService,StripeWebhookService],
  exports: [StripeService,StripeWebhookService],
})
export class PaymentModule {}
