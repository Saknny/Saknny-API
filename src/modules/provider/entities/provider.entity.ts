import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { BaseModel } from '../../../libs/database/base.model';
import { DeepPartial } from '../../../libs/types/deep-partial.type';
import { User } from '../../user/entities/user.entity';
import { Apartment } from '@src/modules/apartment/entities/apartment.entity/apartment.entity';
import { PendingRequest } from '@src/modules/request/entities/pendingRequest.entity';
import { Status } from '@src/modules/request/entities/enum/status.enum';

@Entity()
export class Provider extends BaseModel {
  constructor(input?: DeepPartial<Provider>) {
    super(input);
  }

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: "enum", enum: Status, default: Status.PENDING })
  status: Status;

  @Column()
  userId: string;

  @Column({ nullable: true })
  facebook: string;

  @Column({ nullable: true })
  instagram: string;

  @Column({ nullable: true })
  linkedin: string;

  @Column({ nullable: true })
  gender: string;


  @Column({ type: 'varchar', nullable: true }) 
  idCard: string;

  @Column({ nullable: true })
  image: string;

  @OneToOne(() => User, (user) => user.provider, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;


  @OneToMany(() => Apartment, (apartment) => apartment.provider, { cascade: true })
  apartments: Apartment[];

  // @OneToMany(() => PendingRequest, (pendingRequests) => pendingRequests.provider, { cascade: true })
  // pendingRequests: PendingRequest[];

}
