import { Column, DeepPartial, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseModel } from '../../../../libs/database/base.model';
import { Individual } from '../individual.entity';

@Entity()
export class Photographer extends BaseModel {
  constructor(input?: DeepPartial<Photographer>) {
    super(input);
  }

  @Column({ type: 'text' })
  camera: string;

  @Column({ type: 'text' })
  lightning: string;

  @Column({ type: 'text' })
  lense: string;

  @Column({ type: 'text', array: true, nullable: true })
  profilePicture?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  portfolioPictures?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  reels?: string[];

  @OneToOne(() => Individual, (individual) => individual.photographer, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'individualId' })
  individual: Individual;

  @Column()
  individualId: string;
}
