import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Bed } from '@src/modules/bed/entities/bed.entity/bed.entity';
import { Apartment } from '@src/modules/apartment/entities/apartment.entity/apartment.entity';
import { BaseModel } from '@src/libs/database/base.model';
import { DeepPartial } from '@src/libs/types/deep-partial.type';

@Entity()
export class Room extends BaseModel {
  constructor(input?: DeepPartial<Room>) {
    super(input);
  }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Apartment, (apartment) => apartment.rooms, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  apartment: Apartment;


  @Column('text')
  descriptionEn: string;

  @Column('text')
  descriptionAr: string;

  @Column()
  bedCount: number;

  @Column({ type: 'date', nullable: true })
  availableFor: Date;

  @Column({ default: false })
  hasAirConditioner: boolean;

  @OneToMany(() => Bed, (bed) => bed.room)
  beds: Bed[];

  @Column({ default: 'UNBOOKED' })
  status: string;


  @Column()
  wardrobe: boolean;

  @Column()
  Desk: boolean;

  @Column()
  nightStand: boolean;


  @Column()
  ceilingFan: boolean;




  @Column({nullable:true})
  curtains: boolean;


  @Column({nullable:true})
  balcony: boolean;

}
