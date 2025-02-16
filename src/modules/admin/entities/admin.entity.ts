import { BaseModel } from "@src/libs/database/base.model";
import { User } from "@src/modules/user/entities/user.entity";
import { Column, DeepPartial, Entity, JoinColumn, OneToOne } from "typeorm";

@Entity()
export class Admin extends BaseModel {
    constructor(input?: DeepPartial<Admin>) {
        super(input);
    }
    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    userId: string;

    @OneToOne(() => User, (user) => user.provider, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;
}
