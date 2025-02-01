import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { IndividualModule } from '../individual/individual.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { JwtStrategy } from '@libs/strategies/jwt.strategy';
import { LocalStrategy } from '@libs/strategies/local.strategy';
import { DatabaseModule } from '../../configs/database/database.module';
import { Individual } from '../individual/entities/individual.entity';
import { ContextModule } from '../../libs/application/context/context.module';
import { FCMTokenModule } from '../fcm-token/fcm-token.module';
import { SessionModule } from '../session/session.module';
import { UserModule } from '../user/user.module';
import { Organization } from '../organization/entities/organization.entity';
import { OtpModule } from '../otp/otp.module';
import { Otp } from '../otp/entities/otp.entity';
import { User } from '../user/entities/user.entity';
import { HelperModule } from '../../libs/utils/helper/helper.module';

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
    DatabaseModule.forFeature([Individual, Organization, Otp, User]),
    IndividualModule,
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
