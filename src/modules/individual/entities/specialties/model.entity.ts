import { Column, DeepPartial, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseModel } from '../../../../libs/database/base.model';
import {
  SkinToneEnum,
  EyeColorEnum,
  HairColorEnum,
  IndividualGenderEnum,
} from '../../enums/individual.enum';
import { CountryEnum } from '../../../../libs/enums/countries.enum';
import { Individual } from '../individual.entity';

@Entity()
export class Model extends BaseModel {
  constructor(input?: DeepPartial<Model>) {
    super(input);
  }

  @Column({ type: 'date' })
  birthDate: Date;

  @Column({ enum: IndividualGenderEnum })
  gender: IndividualGenderEnum;

  @Column({ enum: CountryEnum })
  nationality: CountryEnum;

  @Column({ enum: SkinToneEnum })
  skinToneEnum: SkinToneEnum;

  @Column({ enum: HairColorEnum })
  hairColorEnum: HairColorEnum;

  @Column({ enum: EyeColorEnum })
  eyeColorEnum: EyeColorEnum;

  @Column({ type: 'float' })
  weight: number;

  @Column({ type: 'float' })
  height: number;

  @Column({ type: 'float' })
  bust: number;

  @Column({ type: 'float' })
  waist: number;

  @Column({ type: 'float' })
  hips: number;

  @Column({ type: 'float' })
  shoeSize?: number;

  @Column({ type: 'float' })
  dressSize?: number;

  @Column({ type: 'text', array: true, nullable: true })
  profilePicture?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  portfolioPictures?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  headShots?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  fullBodyShots?: string[];

  @OneToOne(() => Individual, (individual) => individual.model, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  @JoinColumn({ name: 'individualId' })
  individual: Individual;

  @Column()
  individualId: string;
}
