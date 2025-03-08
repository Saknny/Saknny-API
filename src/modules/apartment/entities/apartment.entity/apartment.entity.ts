import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Room } from '@src/modules/room/entities/room.entity/room.entity';
import { Provider } from '@src/modules/provider/entities/provider.entity';
import { BaseModel } from '@src/libs/database/base.model';
import { DeepPartial } from '@src/libs/types/deep-partial.type';

import { ApartmentDocument } from '../document.entity';
import { FavoriteList } from '@src/modules/favoriteList/entities/favorite-list.entity';
import { Status } from '@src/modules/request/entities/enum/status.enum';
@Entity()
export class Apartment extends BaseModel {
  constructor(input?: DeepPartial<Apartment>) {
    super(input);
  }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastViewedAt: Date | null;

  @Column('text')
  descriptionEn: string;

  @Column('text')
  descriptionAr: string;

  @ManyToOne(() => Provider, (provider) => provider.apartments, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    nullable: true,
  })
  provider: Provider;

  @Column({ nullable: true })
  roomCount: number;

  @OneToMany(() => Room, (room) => room.apartment)
  rooms: Room[];

  @Column({ default: 'PENDING' })
  status: string; // PENDING , APPROVED , PUBLISHED

  // TODO: make it GenderENUM
  @Column({ nullable: true })
  gender: string;

  @Column({ default: 'UNBOOKED' })
  bookingStatus: string;

  @OneToOne(
    () => ApartmentDocument,
    (apartmentDocument) => apartmentDocument.id,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'apartmentDocumentId' })
  document: ApartmentDocument;

  @Column({ nullable: true })
  favoriteListId: string;

  @ManyToOne(() => FavoriteList, (favoriteList) => favoriteList.apartments, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'favoriteListId' })
  favoriteList: FavoriteList;

  @Column()
  tv: boolean;

  @Column()
  refrigerator: boolean;

  @Column()
  stove: boolean;

  @Column()
  microwave: boolean;

  @Column()
  kettle: boolean;

  @Column()
  washingMachine: boolean;

  @Column()
  waterHeater: boolean;

  @Column()
  standFan: boolean;

  @Column()
  Iron: boolean;

  @Column()
  wifi: boolean;

  @Column()
  elavator: boolean;

  @Column()
  furnished: boolean;

  @Column()
  size: number;

  @Column()
  floor: number;

  @Column()
  bathrooms: number;
}
