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
        enum: Status, default: Status.PENDING,
    })
    status: Status;


    @Column()
    referenceId: string;

    // roomImage  , ...
    @Column()
    referenceType: string;


    @Column({
        type: "enum",
        enum: Type,
    })
    type: Type;


    @Column({
        type: "enum",
        enum: EntityType,
    })
    entityType: EntityType;


    @Column()
    url: string;

    @Column({ nullable: true })
    reason: string;


    @Column({ nullable: true })
    description: string;


    @ManyToOne(() => PendingRequest, (pendingRequest) => pendingRequest.imageApprovals, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    pendingRequest: PendingRequest;

}