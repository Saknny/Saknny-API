import { Column, DeepPartial, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseModel } from '../../../../libs/database/base.model';
import { Individual } from '../individual.entity';

@Entity()
export class Editor extends BaseModel {
  constructor(input?: DeepPartial<Editor>) {
    super(input);
  }

  @Column({ type: 'text' })
  editingSoftware: string;

  @Column({ type: 'boolean' })
  colorGrading: boolean;

  @Column({ type: 'boolean' })
  soundEditing: boolean;

  @Column({ type: 'boolean' })
  visualEffects: boolean;

  @Column({ type: 'boolean' })
  motionGraphics: boolean;

  @Column({ type: 'text', array: true, nullable: true })
  profilePicture?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  portfolioPictures?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  reels?: string[];

  @OneToOne(() => Individual, (individual) => individual.editor, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'individualId' })
  individual: Individual;

  @Column()
  individualId: string;
}
