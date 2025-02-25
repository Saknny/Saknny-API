import { Injectable } from '@nestjs/common';
import { InjectBaseRepository } from '@src/libs/decorators/inject-base-repository.decorator';
import { BaseRepository } from '@src/libs/types/base-repository';
import { SubscriptionPlan } from './subscription-plan.entity/subscription-plan.entity';
import { CreateSubscriptionPlanDto } from './dtos/subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dtos/update-subscription-plan.dto';

@Injectable()
export class SubscriptionPlanService {
    constructor(
        @InjectBaseRepository(SubscriptionPlan)
        private readonly subscriptionPlanRepo: BaseRepository<SubscriptionPlan>
      ) {}

    async createPlan(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> {
        const plan = this.subscriptionPlanRepo.create(dto); 
        return await this.subscriptionPlanRepo.save(plan); 
    }

    async getAllPlans(): Promise<SubscriptionPlan[]> {
        return await this.subscriptionPlanRepo.find();
    }
    
    async getPlanById(id: string): Promise<SubscriptionPlan> {
        return await this.subscriptionPlanRepo.findOneBy({ id });
    }

    async updatePlan(id: string, dto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlan> {
        const plan = await this.subscriptionPlanRepo.findOneBy({ id });
        if (!plan) throw new Error('Subscription plan not found');
    
        Object.assign(plan, dto);
        return await this.subscriptionPlanRepo.save(plan);
    }
    async deletePlan(id: string): Promise<void> {
        const plan = await this.subscriptionPlanRepo.findOneBy({  id  });
        if (!plan) throw new Error('Subscription plan not found');
    
        await this.subscriptionPlanRepo.remove(plan);
    }
}
