import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseModel } from '@src/libs/database/base.model';
import { Apartment } from '@src/modules/apartment/entities/apartment.entity/apartment.entity';
import { Student } from '@src/modules/student/entities/student.entity';

@Entity()
export class Report extends BaseModel {
    @ManyToOne(() => Apartment, (apartment) => apartment.reviews, { onDelete: 'CASCADE' })
    apartment: Apartment;

    @ManyToOne(() => Student, (student) => student.reviews, { onDelete: 'CASCADE' })
    student: Student;

    @Column({ type: 'text', nullable: true })
    comment: string;


}
