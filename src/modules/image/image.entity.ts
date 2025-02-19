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
import { EntityType } from '../request/entities/enum/entityType.enum';

@Entity()
export class Image extends BaseModel {
    constructor(input?: DeepPartial<Image>) {
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

    @Column()
    entityType: EntityType;

    @Column()
    entityId: string;

    @Column({ nullable: true })
    description: string;


}
