import { BaseModel } from '@src/libs/database/base.model';
import { Column, Entity } from 'typeorm';
import { PaymentMethodEnum, PaymentStatusEnum } from '../enum/payment.enum';

@Entity()
export class Payment extends BaseModel {
  @Column()
  orderId: string;

  @Column({ enum: PaymentMethodEnum })
  paymentMethod: PaymentMethodEnum;

  @Column({ default: PaymentStatusEnum.PENDING })
  state: PaymentStatusEnum;

  @Column()
  transactionId: string;

  @Column({ type: 'jsonb' })
  metadata: object;

  @Column()
  totalAmount: number;
}
