import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne
} from 'typeorm';
import { Bed } from '@src/modules/bed/entities/bed.entity/bed.entity';
import { Apartment } from '@src/modules/apartment/entities/apartment.entity/apartment.entity';
import { BaseModel } from '@src/libs/database/base.model';
import { DeepPartial } from '@src/libs/types/deep-partial.type';
import { RoomImage } from '../roomImage.entity';

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
    onUpdate: 'CASCADE'
  })
  apartment: Apartment;

  @OneToMany(() => RoomImage, (images) => images.room, {
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
    nullable: true
  })
  images: RoomImage[];

  @Column("text")
  descriptionEn: string;

  @Column("text")
  descriptionAr: string;

  @Column()
  bedCount: number;

  @Column({ type: 'date', nullable: true })
  availableFor: Date;

  @Column({ default: false })
  hasAirConditioner: boolean;

  @OneToMany(() => Bed, (bed) => bed.room)
  beds: Bed[];
}
