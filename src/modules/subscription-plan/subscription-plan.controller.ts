import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateSubscriptionPlanDto } from './dtos/subscription-plan.dto';
import { SubscriptionPlanService } from './subscription-plan.service';
import { UpdateSubscriptionPlanDto } from './dtos/update-subscription-plan.dto';

@Controller('subscription-plan')
export class SubscriptionPlanController {
    constructor(private readonly subscriptionPlanService: SubscriptionPlanService) {}

@Post('/create')
async createPlan(@Body() dto: CreateSubscriptionPlanDto) {
  return this.subscriptionPlanService.createPlan(dto);
}

@Get('/getallplans')
async getAllPlans() {
    return this.subscriptionPlanService.getAllPlans();
}

@Get(':id/getplanbyid')
async getPlanById(@Param('id') id: string) {
    return this.subscriptionPlanService.getPlanById(id);
}
@Patch(':id/update')
async updatePlan(@Param('id') id: string, @Body() dto: UpdateSubscriptionPlanDto) {
    return this.subscriptionPlanService.updatePlan(id, dto);
}
@Delete(':id')
async deletePlan(@Param('id') id: string) {
    await this.subscriptionPlanService.deletePlan(id);
    return { message: 'Subscription plan deleted successfully' };
}
}
