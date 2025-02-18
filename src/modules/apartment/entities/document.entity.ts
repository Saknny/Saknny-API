import { BaseModel } from "@src/libs/database/base.model";
import { Column, DeepPartial, Entity, JoinColumn, OneToOne } from "typeorm";
import { Apartment } from "./apartment.entity/apartment.entity";

@Entity()
export class ApartmentDocument extends BaseModel {
    constructor(input?: DeepPartial<ApartmentDocument>) {
        super(input);
    }

    @Column({ type: 'varchar', nullable: true })
    document: string;

    @OneToOne(() => Apartment, (apartment) => apartment.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'apartmentId' })
    apartment: Apartment;
}