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
  import { Provider } from '@src/modules/organization/entities/provider.entity'; 
  import { BaseModel } from '@src/libs/database/base.model';  
  import { DeepPartial } from '@src/libs/types/deep-partial.type';
  @Entity()
  export class Apartment extends BaseModel {
    constructor(input?: DeepPartial<Apartment>) {
      super(input);
  }
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @DeleteDateColumn()
    deletedAt: Date;
  
    @Column("text")
    descriptionEn: string;
  
    @Column("text")
    descriptionAr: string;
  
    @Column("text", { array: true })
    images: string[];
  
    @ManyToOne(() => Provider, (provider) => provider.apartments, {
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
      nullable: true
    })
    provider: Provider;
  
    @OneToMany(() => Room, (room) => room.apartment)
    rooms: Room[];
  }
  