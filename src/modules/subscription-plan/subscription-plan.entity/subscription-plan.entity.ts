import { Entity, Column, OneToMany } from 'typeorm';
import { ProviderSubscription } from '@src/modules/provider-subscription/provider-subscription.entity/provider-subscription.entity'; 
import { BaseModel } from '@src/libs/database/base.model';

@Entity()
export class SubscriptionPlan extends BaseModel {
  @Column()
  name: string;

  @Column('decimal')
  price: number;

  @Column()
  durationInDays: number;

  @Column()
  maxApartments: number;

  @OneToMany(() => ProviderSubscription, (sub) => sub.plan)
  subscriptions: ProviderSubscription[];
}
