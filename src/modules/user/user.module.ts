import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseModule } from '../../configs/database/database.module';
import { User } from './entities/user.entity';
import { HelperModule } from '../../libs/utils/helper/helper.module';
import { UserTransformer } from './transformer/user.transformer';
import { Individual } from '../individual/entities/individual.entity';
import { Organization } from '../organization/entities/organization.entity';
import { IndividualModule } from '../individual/individual.module';

@Module({
  imports: [
    DatabaseModule.forFeature([User, Individual, Organization]),
    HelperModule,
    IndividualModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserTransformer],
  exports: [UserService, UserTransformer],
})
export class UserModule {}
