import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { StudentModule } from './modules/student/student.module';
import { SessionModule } from './modules/session/session.module';
import { NotificationModule } from './modules/notification/notification.module';
import { SecurityGroupModule } from './modules/security-group/security-group.module';
import { HttpExceptionFilter } from './libs/application/exceptions/exception-filter';
import { DatabaseModule } from './configs/database/database.module';
import { databaseConfig, dataSource } from './configs/database/postgres.config';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './libs/application/logger/logger.module';
import { QueueModule } from './libs/queue/queue.module';
import { AuthModule } from './modules/auth/auth.module';
import { ResponseInterceptor } from './libs/interceptors/response.interceptor';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ProviderModule } from './modules/provider/provider.module';
import { UserModule } from './modules/user/user.module';
import { OtpModule } from './modules/otp/otp.module';
import { PubSubModule } from './libs/redis-pubsub/pubsub.module';
import { ChatModule } from './modules/chat/chat.module';
import { PaymentModule } from './modules/payment/payment.module';
import { UploaderModule } from './libs/application/uploader/uploader.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ContextAuthService } from './libs/application/context/context-auth.service';
import { AdminModule } from './modules/admin/admin.module';
import { AuthMiddleware } from './libs/middlewares/auth.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule.forRootAsync({
      useFactory: () => databaseConfig,
      async dataSourceFactory(options) {
        if (!options) throw new Error('Invalid options passed');
        return addTransactionalDataSource(dataSource as any);
      },
    }),
    QueueModule.register(),
    AuthModule,
    ProviderModule,
    LoggerModule,
    AdminModule,
    StudentModule,
    SessionModule,
    SecurityGroupModule,
    NotificationModule,
    ProfileModule,
    UserModule,
    OtpModule,
    PubSubModule,
    ChatModule,
    PaymentModule,
    UploaderModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveStaticOptions: {
        setHeaders: (res) => {
          res.set('Cross-Origin-Resource-Policy', 'cross-origin');
        },
      },
    }),
    ProfileModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*'); // Apply to all routes
  }
}
