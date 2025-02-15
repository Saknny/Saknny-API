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
import { Bed } from './bed.entity/bed.entity';
import { BaseModel } from '@src/libs/database/base.model';
import { DeepPartial } from '@src/libs/types/deep-partial.type';

@Entity()
export class BedImage extends BaseModel {
    constructor(input?: DeepPartial<BedImage>) {
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

    @ManyToOne(() => Bed, (bed) => bed.images, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        nullable: true
    })
    bed: Bed;



}
