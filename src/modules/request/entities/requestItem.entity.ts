import { Provider } from "@nestjs/common";
import { BaseModel } from "@src/libs/database/base.model";
import { Column, DeepPartial, Entity, ManyToOne, OneToMany } from "typeorm";
import { PendingRequest } from "./pendingRequest.entity";
import { Status } from "./enum/status.enum";
import { Type } from "./enum/type.enum";
import { EntityType } from "./enum/entityType.enum";
import { ItemType } from "./enum/itemType.enum";
import { ImageApproval } from "./imageApproval.entity";

@Entity()
export class RequestItem extends BaseModel {
    constructor(input?: DeepPartial<RequestItem>) {
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
        enum: EntityType,
        nullable: true,
    })
    entityType?: EntityType;

    @Column({
        type: "enum",
        enum: Type,
        nullable: true,
    })
    type?: Type;


    @OneToMany(() => ImageApproval, (images) => images.Item, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        nullable: true,
    })
    images?: ImageApproval;

    @Column({ type: "jsonb", nullable: true })
    data?: any;

    @Column({ type: 'varchar', nullable: true })
    document?: string;

    @Column({ nullable: true })
    reason?: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true })
    referenceId?: string;

    @Column({
        type: "enum",
        enum: EntityType,
        nullable: true,
    })
    referenceType?: string;


    @Column({nullable:true})
    entityId?:string;

    @Column({nullable:true})
    entityName?:string;

    @ManyToOne(() => PendingRequest, (request) => request.items, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        nullable: true,
    })
    request?: PendingRequest;
}
