import { BaseModel } from '@src/libs/database/base.model';
import { DeepPartial } from '@src/libs/types/deep-partial.type';
import { Provider } from '@src/modules/provider/entities/provider.entity';
import { Room } from '@src/modules/room/entities/room.entity/room.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';

import { FavoriteApartment } from '@src/modules/favoriteList/entities/favorite-apartment.entity';
import { ApartmentDocument } from '../document.entity';
import { ApartmentLocation } from '../../enums/location.enum';
import { Review } from '@src/modules/review/entities/review.entity';
import { Report } from '@src/modules/report/entities/report.entity';
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
  status: string; // PENDING , APPROVED , PUBLISHED ,BLOCKED

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

  @OneToMany(() => FavoriteApartment, (fa) => fa.apartment, { cascade: true })
  favoriteApartments: FavoriteApartment[];

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

  @Column({nullable:true})
  iron: boolean;

  @Column()
  wifi: boolean;

  @Column({nullable:true})
  elevator: boolean;

  @Column()
  furnished: boolean;

  @Column()
  size: number;

  @Column()
  floor: number;

  @Column()
  bathrooms: number;

  @Column({
    type: 'enum',
    enum: ApartmentLocation,
    default: ApartmentLocation.ELSAIDY,
  })
  locationEnum: ApartmentLocation;


  @OneToMany(() => Review, (review) => review.apartment)
  reviews: Review[];

  @Column({ type: 'float', default: 0 }) 
  averageRating: number;

  @OneToMany(() => Report, (report) => report.apartment)
  reports: Report[];

  @Column({ nullable: true })
  title:string;
}
