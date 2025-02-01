import { Ulid } from 'id128';
import {
  CreateDateColumn,
  DeepPartial,
  DeleteDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseModel {
  protected constructor(input?: DeepPartial<BaseModel>) {
    if (input) {
      for (const [key, descriptor] of Object.entries(
        Object.getOwnPropertyDescriptors(input),
      )) {
        if (descriptor.get && !descriptor.set) {
          // A getter has been moved to the entity instance
          // by the CalculatedPropertySubscriber
          // and cannot be copied over to the new instance.
          continue;
        }
        (this as any)[key] = descriptor.value;
      }
    }
  }

  @PrimaryColumn({ type: 'uuid' })
  id: string = Ulid.toRaw(Ulid.generate());

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}
