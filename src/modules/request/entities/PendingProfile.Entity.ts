import { PendingRequest } from "./pendingRequest.entity";
import { BaseModel } from "@src/libs/database/base.model";
import { Column, DeepPartial, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { EntityType } from "./enum/entityType.enum";

@Entity()
export class PendingProfile extends BaseModel {
    constructor(input?: DeepPartial<PendingProfile>) {
        super(input);
    }

    // @OneToOne(() => PendingRequest, (pendingRequest) => pendingRequest.pendingProfile, {
    //     onDelete: 'SET NULL', // ✅ Allow null when related PendingRequest is deleted
    //     onUpdate: 'CASCADE',
    //     nullable: true
    // })
    @JoinColumn({ name: "pendingRequestId" })
    pendingRequest?: PendingRequest;

    @Column({ nullable: true })
    userId?: string;

    @Column({ type: "jsonb", nullable: true })
    data?: any; 

    @Column({ nullable: true })
    reason?: string;

    @Column({ nullable: true })
    description?: string;


    @Column({ nullable: true  , type: "enum",  enum: EntityType})
    entityType?: EntityType;
}
