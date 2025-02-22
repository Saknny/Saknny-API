import { Provider } from "@nestjs/common";
import { BaseModel } from "@src/libs/database/base.model";
import { Column, DeepPartial, Entity, ManyToOne } from "typeorm";
import { PendingRequest } from "./pendingRequest.entity";
import { Status } from "./enum/status.enum";
import { Type } from "./enum/type.enum";
import { EntityType } from "./enum/entityType.enum";

@Entity()
export class ImageApproval extends BaseModel {
    constructor(input?: DeepPartial<ImageApproval>) {
        super(input);
    }

    @Column({
        type: "enum",
        enum: Status,
        default: Status.PENDING,
        nullable: true,
    })
    status?: Status;

    @Column({ nullable: true })
    referenceId?: string;

    // @Column({ nullable: true }) 
    // referenceType?: string;

    @Column({
        type: "enum",
        enum: Type,
        nullable: true, 
    })
    type?: Type;

    @Column({
        type: "enum",
        enum: EntityType,
        nullable: true,
    })
    entityType?: EntityType;

    @Column({ nullable: true }) 
    url?: string;

    @Column({ nullable: true }) 
    reason?: string;

    @Column({ nullable: true }) 
    description?: string;

    @ManyToOne(() => PendingRequest, (pendingRequest) => pendingRequest.imageApprovals, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        nullable: true,
    })
    pendingRequest?: PendingRequest; // ✅ Made optional
}
