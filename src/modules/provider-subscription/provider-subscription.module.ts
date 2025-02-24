import { Module } from '@nestjs/common';
import { ProviderSubscriptionService } from './provider-subscription.service';
import { ProviderSubscriptionController } from './provider-subscription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderSubscription } from './provider-subscription.entity/provider-subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderSubscription])],
  controllers: [ProviderSubscriptionController],
  providers: [ProviderSubscriptionService],
  exports: [ProviderSubscriptionService],
})
export class ProviderSubscriptionModule {}
