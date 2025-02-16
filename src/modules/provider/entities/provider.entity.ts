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

  @Column({ type: Boolean, default: false })
  isTrusted: boolean;


  @Column({ type: Boolean, default: false })
  isReviewed: boolean;

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


  @Column({ type: 'varchar', nullable: true })  // Store idCard as binary
  idCard: string;

  @Column({ nullable: true })
  image: string;

  @OneToOne(() => User, (user) => user.provider, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;


  @OneToMany(() => Apartment, (apartment) => apartment.provider, { cascade: true })
  apartments: Apartment[];
}
