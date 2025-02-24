import { Entity, Column, OneToOne } from 'typeorm';
import { BaseModel } from '@src/libs/database/base.model';
import { ProviderSubscription } from '@src/modules/provider-subscription/provider-subscription.entity/provider-subscription.entity';


@Entity()
export class Payment extends BaseModel {
  @Column('decimal')
  amount: number;

  @Column()
  paymentDate: Date;

  @Column({ type: 'enum', enum: ['Paid', 'Failed', 'Pending'], default: 'Pending' })
  status: string;

  @OneToOne(() => ProviderSubscription, (subscription) => subscription.payment)
  subscription: ProviderSubscription;
}
