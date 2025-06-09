import { BaseModel } from '@src/libs/database/base.model';
import { DeepPartial } from '@src/libs/types/deep-partial.type';
import { Room } from '@src/modules/room/entities/room.entity/room.entity';
import { Student } from '@src/modules/student/entities/student.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { RentalStatusEnum } from '../enums/rental-status.enum';

@Entity()
export class RoomRentalRequest extends BaseModel {
  constructor(input?: DeepPartial<RoomRentalRequest>) {
    super(input);
  }

  @ManyToOne(() => Student, (student) => student.roomRentalRequests, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  student: Student;

  @ManyToOne(() => Room, (room) => room.rentalRequests, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  room: Room;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'enum', enum: RentalStatusEnum })
  status: RentalStatusEnum;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;
}
