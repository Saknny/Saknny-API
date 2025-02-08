import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseModule } from '../../configs/database/database.module';
import { User } from './entities/user.entity';
import { HelperModule } from '../../libs/utils/helper/helper.module';
import { UserTransformer } from './transformer/user.transformer';
import { Student } from '../individual/entities/student.entity';
import { Organization } from '../organization/entities/organization.entity';
import { StudentModule } from '../individual/student.module';

@Module({
  imports: [
    DatabaseModule.forFeature([User, Student, Organization]),
    HelperModule,
    StudentModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserTransformer],
  exports: [UserService, UserTransformer],
})
export class UserModule {}
