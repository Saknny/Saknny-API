import { PendingRequest } from "./pendingRequest.entity";
import { BaseModel } from "@src/libs/database/base.model";
import { Column, DeepPartial, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";

@Entity()
export class PendingProfile extends BaseModel {
    constructor(input?: DeepPartial<PendingProfile>) {
        super(input);
    }

    @OneToOne(() => PendingRequest, (pendingRequest) => pendingRequest.pendingProfile, {
        onDelete: 'SET NULL', // ✅ Allow null when related PendingRequest is deleted
        onUpdate: 'CASCADE',
        nullable: true
    })
    @JoinColumn({ name: "pendingRequestId" }) 
    pendingRequest?: PendingRequest; // ✅ Made optional

    @Column({ nullable: true }) // ✅ Allows NULL values
    userId?: string;

    @Column({ type: "jsonb", nullable: true }) // ✅ Allows NULL values
    data?: any; // Can be null if no data is provided

    @Column({ nullable: true }) // ✅ Allows NULL values
    reason?: string;

    @Column({ nullable: true }) // ✅ Allows NULL values
    description?: string;
}
