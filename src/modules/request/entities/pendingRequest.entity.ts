import { BaseModel } from "@src/libs/database/base.model";
import { Column, DeepPartial, Entity, ManyToOne, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { ImageApproval } from "./imageApproval.entity";
import { Provider } from "@src/modules/provider/entities/provider.entity";
import { Status } from "./enum/status.enum";
import { Type } from "./enum/type.enum";
import { PendingDocument } from "./pendingDocument.entity";
import { RequestItem } from "./RequestItem.entity";
import { EntityType } from "./enum/entityType.enum";

@Entity()
export class PendingRequest extends BaseModel {
    constructor(input?: DeepPartial<PendingRequest>) {
        super(input);
    }

    @Column({
        type: "enum",
        enum: Status,
        default: Status.PENDING,
        nullable: true,
    })
    status?: Status;

    @Column({
        type: "enum",
        enum: Type,
        nullable: true,
    })
    type?: Type;

    @Column({ nullable: true })
    reason?: string;

    @Column({ nullable: true })
    description?: string;


    @Column({ nullable: true })
    referenceId?: string;

    @Column({ nullable: true })
    userId?: string;

    @Column({
        type: "enum",
        enum: EntityType,
        nullable: true,
    })
    referenceType?: string;

    @OneToMany(() => RequestItem, (item) => item.request, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        nullable: true,
    })
    items?: RequestItem[];


}
