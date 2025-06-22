import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BaseRepository } from '@src/libs/types/base-repository';
import { ProviderSubscription } from './provider-subscription.entity/provider-subscription.entity';
import { SubscriptionPlan } from '../subscription-plan/subscription-plan.entity/subscription-plan.entity';
import { SelectPlanDto } from './dtos/select-plan.dto';
import { Provider } from '../provider/entities/provider.entity';
import { InjectBaseRepository } from '@src/libs/decorators/inject-base-repository.decorator';
import { Payment } from '../payment/payment.entity/payment.entity';
import { StripeService } from '../payment/stripe.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThan } from 'typeorm';

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
        @Inject(StripeService)
        private readonly stripeService: StripeService,
    ) { }

    async selectPlan(userId: string, dto: SelectPlanDto) {
        const provider = await this.providerRepo.createQueryBuilder('provider')
            .where('provider.userId = :userId', { userId })
            .getOne();
        if (!provider) throw new NotFoundException('Provider not found');

        // Step 1: Find the current active subscription
        const currentSubscription = await this.providerSubscriptionRepo
            .createQueryBuilder('subscription')
            .innerJoin('subscription.provider', 'provider') // Join the 'provider' relation
            .where('provider.id = :providerId', { providerId: provider.id }) // Filter by providerId
            .andWhere('subscription.isActive = :isActive', { isActive: true }) // Ensure the subscription is active
            .getOne();

        if (currentSubscription) {
            // Step 2: Deactivate the old subscription
            console.log(currentSubscription);
            currentSubscription.isActive = false;
            await this.providerSubscriptionRepo.save(currentSubscription);
        }

        const plan = await this.subscriptionPlanRepo.findOneBy({ id: dto.planId });
        if (!plan) throw new NotFoundException('Subscription plan not found');

        const subscription = this.providerSubscriptionRepo.create({
            provider,
            endDate: new Date(Date.now() + plan.durationInDays * 24 * 60 * 60 * 1000), // duration in days
            plan,
            maxApartments: plan.maxApartments,
        });

        const payment = this.paymentRepo.create({
            amount: plan.price,
            status: 'Pending',
            subscription,
        });


        await this.providerSubscriptionRepo.save(subscription);
        payment.subscription = subscription;
        await this.paymentRepo.save(payment);
        // Create a Stripe Checkout session
        const session = await this.stripeService.createCheckoutSession(plan.price, subscription.id, payment.id);


        return session;
    }


    async checkSubscriptionLimit(providerId: string) {
        const subscription = await this.providerSubscriptionRepo.findOneBy({
            provider: { id: providerId }
        });
        return subscription.isActive && subscription.maxApartments;
    }

    async reduceMaxApartments(providerId: string) {
        const subscription = await this.providerSubscriptionRepo.findOneBy({
            provider: { id: providerId }
        });
        subscription.maxApartments -= 1;
        await this.providerSubscriptionRepo.save(subscription);
    }


    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async checkAndExpireSubscriptions() {
        const currentDate = new Date();

        const expiredSubscriptions = await this.providerSubscriptionRepo.find({
            where: {
                isActive: true,
                endDate: LessThan(currentDate),
            },
        });

        for (const subscription of expiredSubscriptions) {
            subscription.isActive = false;
            await this.providerSubscriptionRepo.save(subscription);
            console.log(`Expired subscription with ID: ${subscription.id}`);
        }
    }


}