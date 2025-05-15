import { BaseModel } from '@src/libs/database/base.model';
import { DeepPartial } from '@src/libs/types/deep-partial.type';
import { Bed } from '@src/modules/bed/entities/bed.entity/bed.entity';
import { Student } from '@src/modules/student/entities/student.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { RentalStatusEnum } from '../enums/rental-status.enum';

@Entity()
export class RentalRequest extends BaseModel {
  constructor(input?: DeepPartial<RentalRequest>) {
    super(input);
  }

  @ManyToOne(() => Student, (student) => student.rentalRequests, {
    nullable: false,
  })
  student: Student;

  @ManyToOne(() => Bed, (bed) => bed.rentalRequests, { nullable: false })
  bed: Bed;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number; // Auction-style price

  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'enum', enum: RentalStatusEnum })
  status: RentalStatusEnum;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

}
