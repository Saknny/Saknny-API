import { Controller, Param, Post } from '@nestjs/common';
import { ProviderSubscriptionService } from './provider-subscription.service';
import { currentUser } from '@src/libs/decorators/currentUser.decorator';
import { currentUserType } from '@src/libs/types/current-user.type';
import { SelectPlanDto } from './dtos/select-plan.dto';

@Controller('provider-subscription')
export class ProviderSubscriptionController {
    constructor(private readonly providerSubscriptionService: ProviderSubscriptionService) { }

    @Post('select-plan/:planId')
    async selectPlan(
        @currentUser() { id }: currentUserType,
        @Param('planId') planId: string,
    ) {
        const dto: SelectPlanDto = { planId };
        return await this.providerSubscriptionService.selectPlan(id, dto);
    }

}
