import { BaseModel } from "@src/libs/database/base.model";
import { Column, DeepPartial, Entity, ManyToOne, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { ImageApproval } from "./imageApproval.entity";
import { Provider } from "@src/modules/provider/entities/provider.entity";
import { Status } from "./enum/status.enum";
import { Type } from "./enum/type.enum";
import { PendingProfile } from "./PendingProfile.Entity";

@Entity()
export class PendingRequest extends BaseModel {
    constructor(input?: DeepPartial<PendingRequest>) {
        super(input);
    }

    @Column({
        type: "enum",
        enum: Status,
        default: Status.PENDING,
        nullable: true, // ✅ Make nullable
    })
    status?: Status;

    @Column({
        type: "enum",
        enum: Type,
        nullable: true, // ✅ Make nullable
    })
    type?: Type;

    @Column({ nullable: true }) // ✅ Make nullable
    reason?: string;

    @Column({ nullable: true }) // ✅ Make nullable
    description?: string;

    @OneToMany(() => ImageApproval, (imageApproval) => imageApproval.pendingRequest, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        nullable: true,
    })
    imageApprovals?: ImageApproval[];

    @ManyToOne(() => Provider, (provider) => provider.pendingRequests, {
        onDelete: "SET NULL", // ✅ Set NULL instead of CASCADE
        onUpdate: "CASCADE",
        nullable: true,
    })
    provider?: Provider;

    @OneToOne(() => PendingProfile, (pendingProfile) => pendingProfile.pendingRequest, {
        onDelete: "SET NULL", // ✅ Set NULL instead of CASCADE
        onUpdate: "CASCADE",
        nullable: true,
    })
    @JoinColumn({ name: "pendingProfileId" }) // ✅ Ensure foreign key is managed correctly
    pendingProfile?: PendingProfile;
}
