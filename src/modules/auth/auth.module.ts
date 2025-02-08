import { JwtStrategy } from '@libs/strategies/jwt.strategy';
import { LocalStrategy } from '@libs/strategies/local.strategy';
import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from '../../configs/database/database.module';
import { ContextModule } from '../../libs/application/context/context.module';
import { HelperModule } from '../../libs/utils/helper/helper.module';
import { FCMTokenModule } from '../fcm-token/fcm-token.module';
import { Student } from '../individual/entities/student.entity';
import { StudentModule } from '../individual/student.module';
import { Organization } from '../organization/entities/organization.entity';
import { Otp } from '../otp/entities/otp.entity';
import { OtpModule } from '../otp/otp.module';
import { SessionModule } from '../session/session.module';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async () => {
        const options: JwtModuleOptions = {
          signOptions: { algorithm: 'RS256' },
          verifyOptions: { algorithms: ['RS256'] },
        };
        return options;
      },
    }),
    DatabaseModule.forFeature([Student, Organization, Otp, User]),
    StudentModule,
    ContextModule,
    SessionModule,
    FCMTokenModule,
    PassportModule,
    UserModule,
    OtpModule,
    HelperModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
