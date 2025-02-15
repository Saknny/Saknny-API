import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, UpdateDateColumn,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany
} from 'typeorm';
import { Room } from '@src/modules/room/entities/room.entity/room.entity';
import { Student } from '@src/modules/student/entities/student.entity';
import { BaseModel } from '@src/libs/database/base.model';
import { DeepPartial } from '@src/libs/types/deep-partial.type';
import { BedImage } from '../bedImage.entity';
@Entity()
export class Bed extends BaseModel {
  constructor(input?: DeepPartial<Bed>) {
    super(input);
  }

  @Column({ default: 'AVAILABLE' })
  status: string;

  @Column("text")
  descriptionEn: string;

  @Column("text")
  descriptionAr: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;
  @OneToMany(() => BedImage, (images) => images.bed, {
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
      nullable: true
  })
  images: BedImage[];

  @ManyToOne(() => Room, (room) => room.beds, { nullable: false })
  room: Room;

  @OneToOne(() => Student, (student) => student.bed, { nullable: true })
  student: Student;
}
