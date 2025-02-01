import { Entity, Column } from 'typeorm';
import { IsArray, IsNotEmpty } from 'class-validator';
import { BaseModel } from '@src/libs/database/base.model';
import { DeepPartial } from '@libs/types/deep-partial.type';

@Entity()
export class SecurityGroup extends BaseModel {
  constructor(input?: DeepPartial<SecurityGroup>) {
    super(input);
  }
  @Column({ unique: true })
  @IsNotEmpty()
  groupName: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column('simple-array')
  @IsArray()
  @IsNotEmpty()
  permissions: string[];
}
