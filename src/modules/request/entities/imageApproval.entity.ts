import { Provider } from "@nestjs/common";
import { BaseModel } from "@src/libs/database/base.model";
import { Column, DeepPartial, Entity, ManyToOne } from "typeorm";
import { PendingRequest } from "./pendingRequest.entity";
import { Status } from "./enum/status.enum";
import { Type } from "./enum/type.enum";
import { EntityType } from "./enum/entityType.enum";
import { RequestItem } from "./RequestItem.entity";

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
    url?: string;

    @Column({ nullable: true }) 
    reason?: string;

    @Column({ nullable: true }) 
    description?: string;

    @ManyToOne(() => RequestItem, (Item) => Item.images, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        nullable: true,
    })
    Item?: RequestItem; 
}
