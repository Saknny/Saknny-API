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
        nullable: true, // ✅ Allows NULL values
    })
    status?: Status;

    @Column({ nullable: true }) // ✅ Allows NULL values
    referenceId?: string;

    @Column({ nullable: true }) // ✅ Allows NULL values
    referenceType?: string;

    @Column({
        type: "enum",
        enum: Type,
        nullable: true, // ✅ Allows NULL values
    })
    type?: Type;

    @Column({
        type: "enum",
        enum: EntityType,
        nullable: true, // ✅ Allows NULL values
    })
    entityType?: EntityType;

    @Column({ nullable: true }) // ✅ Allows NULL values
    url?: string;

    @Column({ nullable: true }) // ✅ Allows NULL values
    reason?: string;

    @Column({ nullable: true }) // ✅ Allows NULL values
    description?: string;

    @ManyToOne(() => PendingRequest, (pendingRequest) => pendingRequest.imageApprovals, {
        onDelete: "SET NULL", // ✅ Allows ImageApproval to exist if PendingRequest is deleted
        onUpdate: "CASCADE",
        nullable: true,
    })
    pendingRequest?: PendingRequest; // ✅ Made optional
}
