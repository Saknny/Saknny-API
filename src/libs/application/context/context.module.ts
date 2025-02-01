import { Global, Module } from '@nestjs/common';
import { IContextAuthServiceToken } from './context-auth.interface';
import { ContextAuthService } from './context-auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from '../../../modules/session/entities/session.entity';
import { User } from '../../../modules/user/entities/user.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, Session])],
  providers: [
    { useClass: ContextAuthService, provide: IContextAuthServiceToken },
  ],
  exports: [
    { useClass: ContextAuthService, provide: IContextAuthServiceToken },
  ],
})
export class ContextModule {}
