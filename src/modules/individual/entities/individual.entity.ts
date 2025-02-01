import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
  OneToMany,
} from 'typeorm';
import { BaseModel } from '../../../libs/database/base.model';
import { IndividualRoleEnum } from '../enums/individual.enum';
import { DeepPartial } from '../../../libs/types/deep-partial.type';
import { User } from '../../user/entities/user.entity';
import { IsDate, IsString, Validate } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { IsEndDateAfterStartDate } from '../../../libs/utils/validators/is-endDate-after-startDate';
import { Model } from './specialties/model.entity';
import { Editor } from './specialties/editor.entity';
import { Photographer } from './specialties/photographer.entity';
import { Videographer } from './specialties/videographer.entity';
import { JobRequest } from '../../request/entities/request.entity';
import { Review } from '../../job/entities/review.entity';
import { Job } from '../../job/entities/job.entity';

export class WorkExperience {
  @Expose()
  @IsString()
  title: string;

  @Expose()
  @IsString()
  company: string;

  @Expose()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @Expose()
  @IsDate()
  @Type(() => Date)
  @Validate(IsEndDateAfterStartDate)
  endDate: Date;
}

@Entity()
export class Individual extends BaseModel {
  constructor(input?: DeepPartial<Individual>) {
    super(input);
  }

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  fullName?: string;

  @Column({ enum: IndividualRoleEnum, nullable: true })
  role: IndividualRoleEnum;

  @Column({ type: Boolean, default: true })
  isVisible: boolean;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  socialAccount: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: Number, nullable: true })
  yearsOfExperience: number;

  @Column('jsonb', { nullable: true })
  workExperience: WorkExperience[];

  @Column({ type: Boolean, nullable: true })
  availableForTravel: boolean;

  @Column({ type: Boolean, nullable: true })
  legallyWorking: boolean;

  @Column({ type: Boolean, nullable: true })
  holdingBachelors: boolean;

  @Column({ type: Boolean, default: false })
  onboardingCompleted: boolean;

  @Column()
  userId: string;

  @OneToOne(() => User, (user) => user.individual, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToOne(() => Model, (model) => model.individual, { eager: true })
  model: Model;

  @OneToOne(() => Photographer, (pg) => pg.individual, { eager: true })
  photographer: Photographer;

  @OneToOne(() => Videographer, (vg) => vg.individual, { eager: true })
  videographer: Videographer;

  @OneToOne(() => Editor, (editor) => editor.individual, { eager: true })
  editor: Editor;

  @OneToMany(() => JobRequest, (jobRequest) => jobRequest.individual)
  jobRequests: JobRequest[];

  @OneToMany(() => Job, (job) => job.individual)

  jobs: Job[];


  @Column({ type: 'tsvector', nullable: true })
  individualSearchVector: string;

  specialtyInfo: Model | Editor | Photographer | Videographer;

  @BeforeInsert()
  @BeforeUpdate()
  setFullName() {
    if (this.firstName && this.lastName) {
      this.fullName = `${this.firstName} ${this.lastName}`;
    }
  }

  @AfterLoad()
  setSpecialtyInfo() {
    const roleMapping = {
      [IndividualRoleEnum.MODEL]: this.model,
      [IndividualRoleEnum.EDITOR]: this.editor,
      [IndividualRoleEnum.PHOTOGRAPHER]: this.photographer,
      [IndividualRoleEnum.VIDEOGRAPHER]: this.videographer,
    };

    this.specialtyInfo = roleMapping[this.role] || null;
  }

  @OneToMany(() => Review, (review) => review.reviewer)
  reviews: Review[];
}
