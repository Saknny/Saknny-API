import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseModel } from '../../../libs/database/base.model';
import { DeepPartial } from '../../../libs/types/deep-partial.type';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Organization extends BaseModel {
  constructor(input?: DeepPartial<Organization>) {
    super(input);
  }

  @Column({ type: 'text', nullable: true })
  logo: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  instagram?: string;

  @Column({ nullable: true })
  tiktok?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: Boolean, default: false })
  onboardingCompleted: boolean;

  @Column()
  userId: string;

  @OneToOne(() => User, (user) => user.organization, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
