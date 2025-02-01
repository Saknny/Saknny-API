import { Column, DeepPartial, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseModel } from '../../../../libs/database/base.model';
import { Individual } from '../individual.entity';

@Entity()
export class Videographer extends BaseModel {
  constructor(input?: DeepPartial<Videographer>) {
    super(input);
  }

  @Column({ type: 'text' })
  camera: string;

  @Column({ type: 'text' })
  lightning: string;

  @Column({ type: 'text' })
  lense: string;

  @Column({ type: 'boolean' })
  stabilizer: boolean;

  @Column({ type: 'text', array: true, nullable: true })
  profilePicture?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  portfolioPictures?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  reels?: string[];

  @OneToOne(() => Individual, (individual) => individual.videographer, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'individualId' })
  individual: Individual;

  @Column()
  individualId: string;
}
