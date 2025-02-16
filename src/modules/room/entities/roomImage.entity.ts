import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToMany,
    ManyToOne
} from 'typeorm';
import { Room } from '@src/modules/room/entities/room.entity/room.entity';
import { BaseModel } from '@src/libs/database/base.model';
import { DeepPartial } from '@src/libs/types/deep-partial.type';

@Entity()
export class RoomImage extends BaseModel {
    constructor(input?: DeepPartial<RoomImage>) {
        super(input);
    }

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @Column("text", { nullable: true })
    imageUrl: string;

    @ManyToOne(() => Room, (room) => room.images, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        nullable: true
    })
    room: Room;



}
