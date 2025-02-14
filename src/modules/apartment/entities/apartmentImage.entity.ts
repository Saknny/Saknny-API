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
import { Room } from '@src/modules/room/entities/room.entity/room.entity';
import { Provider } from '@src/modules/provider/entities/provider.entity';
import { BaseModel } from '@src/libs/database/base.model';
import { DeepPartial } from '@src/libs/types/deep-partial.type';
import { Apartment } from './apartment.entity/apartment.entity';
@Entity()
export class ApartmentImage extends BaseModel {
  constructor(input?: DeepPartial<ApartmentImage>) {
    super(input);
  }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column("text", { nullable: true })
  imageUrl: string;

  @ManyToOne(() => Apartment, (apartment) => apartment.images, {
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
    nullable: true
  })
  apartment:Apartment;



}
