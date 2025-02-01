import {
    Column,
    DeepPartial,
    Entity,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { BaseModel } from '../../../libs/database/base.model';
  import { Job } from './job.entity';
  import { Individual } from '../../individual/entities/individual.entity';
  
  @Entity()
  export class Review extends BaseModel {
    constructor(input?: DeepPartial<Review>) {
      super(input);
    }
  
    @Column({ type: 'int' })
    rating: number; 
  
    @Column({ type: 'text' })
    comment: string; 
  
    @ManyToOne(() => Job, (job) => job.reviews, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'jobId' })
    job: Job; 
  
    @Column()
    jobId: string; 
  
    @ManyToOne(() => Individual, (individual) => individual.reviews, {
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'reviewerId' })
    reviewer: Individual;
  
    @Column()
    reviewerId: string; 
  }