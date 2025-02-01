import { BaseModel } from '@src/libs/database/base.model';
import { DeepPartial } from '../../../types/deep-partial.type';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ModelWhichUploadedFor } from '../types/uploader.type';
import { User } from '../../../../modules/user/entities/user.entity';

@Entity()
@Index(['relativeDiskDestination'])
export class File extends BaseModel {
  constructor(input?: DeepPartial<File>) {
    super(input);
  }

  @Column({ nullable: false })
  relativeDiskDestination: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  encoding?: string;

  @Column({ nullable: true })
  mimetype?: string;

  @Column({ nullable: true })
  sizeInBytes?: number;

  @Column('simple-array', { nullable: false, default: [] })
  downloadedByUsersIds: string[];

  @Column({ nullable: false, default: false })
  hasReferenceAtDatabase: boolean;

  @Column({ type: 'jsonb', nullable: true })
  modelWhichUploadedFor?: ModelWhichUploadedFor;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy?: User;
}
