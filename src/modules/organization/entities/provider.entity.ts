import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseModel } from '../../../libs/database/base.model';
import { DeepPartial } from '../../../libs/types/deep-partial.type';
import { User } from '../../user/entities/user.entity';

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
  isVerified: boolean;

  @Column()
  userId: string;

  @OneToOne(() => User, (user) => user.provider, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column('jsonb')
  socialLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };

  // Documents 
  @Column()
  idCard:string;

  @Column()
  image:string
}
