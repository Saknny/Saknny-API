import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseModule } from '../../configs/database/database.module';
import { User } from './entities/user.entity';
import { HelperModule } from '../../libs/utils/helper/helper.module';
import { UserTransformer } from './transformer/user.transformer';
import { Student } from '../student/entities/student.entity';
import { Provider } from '../provider/entities/provider.entity';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [
    DatabaseModule.forFeature([User, Student, Provider]),
    HelperModule,
    StudentModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserTransformer],
  exports: [UserService, UserTransformer],
})
export class UserModule { }
