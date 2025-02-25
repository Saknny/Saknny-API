import { Module } from '@nestjs/common';
import { ProviderSubscriptionService } from './provider-subscription.service';
import { ProviderSubscriptionController } from './provider-subscription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderSubscription } from './provider-subscription.entity/provider-subscription.entity';
import { Provider } from '../provider/entities/provider.entity';
import { SubscriptionPlan } from '../subscription-plan/subscription-plan.entity/subscription-plan.entity';
import { Payment } from '../payment/payment.entity/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderSubscription,
    Provider,        
    SubscriptionPlan,
    Payment
  ])],
  controllers: [ProviderSubscriptionController],
  providers: [ProviderSubscriptionService],
  exports: [ProviderSubscriptionService],
})
export class ProviderSubscriptionModule {}
