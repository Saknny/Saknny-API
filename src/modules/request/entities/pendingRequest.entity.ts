import { BaseModel } from "@src/libs/database/base.model";
import { Column, DeepPartial, Entity, ManyToOne, OneToMany } from "typeorm";
import { ImageApproval } from "./imageApproval.entity";
import { Provider } from "@src/modules/provider/entities/provider.entity";
import { IsEnum } from "class-validator";
import { Status } from "./enum/status.enum";
import { Type } from "./enum/type.enum";

@Entity()
export class PendingRequest extends BaseModel {
    constructor(input?: DeepPartial<PendingRequest>) {
        super(input);
    }

    
   
    @Column({
        type: "enum",
        enum: Status, default: Status.PENDING,
    })
    status: Status;

    
    @Column({
        type: "enum",
        enum:Type,
    })
    type: Type;

    @Column({ nullable: true })
    reason: string;


    @Column({ nullable: true })
    description: string;


    @OneToMany(() => ImageApproval, (imageApproval) => imageApproval.pendingRequest, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        nullable: true
    })
    imageApprovals: ImageApproval[];


    @ManyToOne(() => Provider, (provider) => provider.pendingRequests, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    provider:Provider;

}