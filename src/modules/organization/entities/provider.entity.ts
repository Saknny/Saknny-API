import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseModel } from '../../../libs/database/base.model';
import { DeepPartial } from '../../../libs/types/deep-partial.type';
import { User } from '../../user/entities/user.entity';

export class SocialLinks {

  instagram?: string;

  facebook?: string;

  twitter?: string;

  linkedin?: string;
}

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

  @Column()
  userId: string;

  @OneToOne(() => User, (user) => user.provider, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  facebook: string;

  @Column({ nullable: true })
  instagram: string;

  @Column({ nullable: true })
  linkedin: string;

 

  // Documents 
  @Column({ nullable: true })
  idCard: string;

  @Column({ nullable: true })
  image: string
}

