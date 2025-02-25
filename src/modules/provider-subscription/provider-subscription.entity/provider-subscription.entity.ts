import { Entity, Column, ManyToOne, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Provider } from '@src/modules/provider/entities/provider.entity';
import { SubscriptionPlan } from '@src/modules/subscription-plan/subscription-plan.entity/subscription-plan.entity'; 
import { Payment } from '@src/modules/payment/payment.entity/payment.entity';
import { BaseModel } from '@src/libs/database/base.model';

@Entity()
export class ProviderSubscription extends BaseModel {
  @CreateDateColumn()
  startDate: Date;

  @CreateDateColumn()
  endDate: Date;

  @Column({ default: false })
  isActive: boolean;

  @ManyToOne(() => Provider, (provider) => provider.subscriptions, { onDelete: 'CASCADE' })
  provider: Provider;

  @ManyToOne(() => SubscriptionPlan, (plan) => plan.subscriptions)
  plan: SubscriptionPlan;

  @OneToOne(() => Payment, (payment) => payment.subscription)
  @JoinColumn()
  payment: Payment;
}
