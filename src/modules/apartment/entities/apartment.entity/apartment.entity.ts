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
  JoinColumn
} from 'typeorm';
import { Room } from '@src/modules/room/entities/room.entity/room.entity';
import { Provider } from '@src/modules/provider/entities/provider.entity';
import { BaseModel } from '@src/libs/database/base.model';
import { DeepPartial } from '@src/libs/types/deep-partial.type';
import { ApartmentImage } from '../apartmentImage.entity';
import { ApartmentDocument } from '../document.entity';
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

  @Column("text")
  descriptionEn: string;

  @Column("text")
  descriptionAr: string;

  @OneToMany(() => ApartmentImage, (images) => images.apartment, {
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
    nullable: true
  })
  images: ApartmentImage[];

  @ManyToOne(() => Provider, (provider) => provider.apartments, {
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
    nullable: true
  })
  provider: Provider;

  @OneToMany(() => Room, (room) => room.apartment)
  rooms: Room[];


  @Column({ type: Boolean, default: false })
  isReviewed: boolean;

  @Column({ type: Boolean, default: false })
  isTrusted: boolean;

  @Column({ nullable: true })
  gender: string;


  @Column({ default: "UNBOOKED" })
  status: string;


  @OneToOne(() => ApartmentDocument, (apartmentDocument) => apartmentDocument.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'apartmentDocumentId' })
  document: ApartmentDocument;

}
