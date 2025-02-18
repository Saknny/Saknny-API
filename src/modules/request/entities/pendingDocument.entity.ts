import { BaseModel } from "@src/libs/database/base.model";
import { Column, DeepPartial, Entity, JoinColumn, OneToOne } from "typeorm";
import { PendingRequest } from "./pendingRequest.entity";

@Entity()
export class PendingDocument extends BaseModel {
    constructor(input?: DeepPartial<PendingDocument>) {
        super(input);
    }

    @Column({ type: 'varchar', nullable: true })
    document?: string;


    @Column({ nullable: true })
    entityId?: string; // apartment Id

    @OneToOne(() => PendingRequest, (pendingRequest) => pendingRequest.pendingDocument, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        nullable: true
    })
    @JoinColumn({ name: "pendingRequestId" })
    pendingRequest?: PendingRequest;
}