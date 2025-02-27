import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BaseRepository } from '@src/libs/types/base-repository';
import { ProviderSubscription } from './provider-subscription.entity/provider-subscription.entity';
import { SubscriptionPlan } from '../subscription-plan/subscription-plan.entity/subscription-plan.entity';
import { SelectPlanDto } from './dtos/select-plan.dto';
import { Provider } from '../provider/entities/provider.entity';
import { InjectBaseRepository } from '@src/libs/decorators/inject-base-repository.decorator';
import { Payment } from '../payment/payment.entity/payment.entity';
import { StripeService } from '../payment/stripe.service';

@Injectable()
export class ProviderSubscriptionService {
    constructor(
        @InjectBaseRepository(ProviderSubscription)
        private readonly providerSubscriptionRepo: BaseRepository<ProviderSubscription>,
        @InjectBaseRepository(Provider)
        private readonly providerRepo: BaseRepository<Provider>,
        @InjectBaseRepository(SubscriptionPlan)
        private readonly subscriptionPlanRepo: BaseRepository<SubscriptionPlan>,
        @InjectBaseRepository(Payment)
        private readonly paymentRepo: BaseRepository<Payment>,
        @Inject( StripeService)
        private readonly stripeService: StripeService,
    ) {}

    async selectPlan(userId: string, dto: SelectPlanDto) {
        const provider = await this.providerRepo.createQueryBuilder('provider')
        .where('provider.userId = :userId', { userId })
        .getOne();
        if (!provider) throw new NotFoundException('Provider not found');

        const plan = await this.subscriptionPlanRepo.findOneBy({ id: dto.planId } );
        if (!plan) throw new NotFoundException('Subscription plan not found');

        const subscription = this.providerSubscriptionRepo.create({
            provider,
            plan
        });
        // Create a Stripe Checkout session
        const session = await this.stripeService.createCheckoutSession(100, subscription.id);

        const payment = this.paymentRepo.create({
            amount: 100, // Example amount, change as needed
            // paymentDate: new Date(),
            status: 'Pending',
            subscription,
        });
        await this.providerSubscriptionRepo.save(subscription);
        payment.subscription = subscription; 
        await this.paymentRepo.save(payment);

        return { message: 'Redirect to Stripe for payment', sessionUrl: session.url };
    }
}
