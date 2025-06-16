import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DatabaseModule } from './configs/database/database.module';
import { databaseConfig, dataSource } from './configs/database/postgres.config';
import { HttpExceptionFilter } from './libs/application/exceptions/exception-filter';
import { LoggerModule } from './libs/application/logger/logger.module';
import { UploaderModule } from './libs/application/uploader/uploader.module';
import { ResponseInterceptor } from './libs/interceptors/response.interceptor';
import { AuthMiddleware } from './libs/middlewares/auth.middleware';
import { QueueModule } from './libs/queue/queue.module';
import { PubSubModule } from './libs/redis-pubsub/pubsub.module';
import { AdminModule } from './modules/admin/admin.module';
import { ApartmentModule } from './modules/apartment/apartment.module';
import { AuthModule } from './modules/auth/auth.module';
import { BedModule } from './modules/bed/bed.module';
import { ChatModule } from './modules/chat/chat.module';
import { FavoriteModule } from './modules/favoriteList/favorite.module';
import { ImageModule } from './modules/image/image.module';
import { OtpModule } from './modules/otp/otp.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ProviderSubscriptionModule } from './modules/provider-subscription/provider-subscription.module';
import { ProviderModule } from './modules/provider/provider.module';
import { PendingRequestModule } from './modules/request/pendingRequest.module';
import { RoomModule } from './modules/room/room.module';
import { SecurityGroupModule } from './modules/security-group/security-group.module';
import { SessionModule } from './modules/session/session.module';
import { StudentModule } from './modules/student/student.module';
import { SubscriptionPlanModule } from './modules/subscription-plan/subscription-plan.module';
import { UserModule } from './modules/user/user.module';
import { BookingRequestModule } from './modules/booking-request/booking-request.module';
import { ReviewModule } from './modules/review/review.module';
import { ReportModule } from './modules/report/report.module';
import { UniversityModule } from './modules/university/university.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule.forRootAsync({
      useFactory: () => databaseConfig,
      async dataSourceFactory(options) {
        if (!options) throw new Error('Invalid options passed');
        if (!dataSource.isInitialized) {
                await dataSource.initialize();
        }
        return addTransactionalDataSource(dataSource as any);
      },
    }),
    QueueModule,
    AuthModule,
    ProviderModule,
    LoggerModule,
    AdminModule,
    StudentModule,
    SessionModule,
    SecurityGroupModule,
    ProfileModule,
    UserModule,
    OtpModule,
    PubSubModule,
    ChatModule,
    PaymentModule,
    UploaderModule,
    RoomModule,
    BedModule,
    ApartmentModule,
    ReviewModule,
    ReportModule,
    // ServeStaticModule.forRoot({
    //   rootPath: join(process.cwd(), 'public'),
    //   serveStaticOptions: {
    //     setHeaders: (res) => {
    //       res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    //     },
    //   },
    // }),
    ProfileModule,
    BedModule,
    RoomModule,
    ApartmentModule,
    PendingRequestModule,
    FavoriteModule,
    ImageModule,
    SubscriptionPlanModule,
    ProviderSubscriptionModule,
    PaymentModule,
    SubscriptionPlanModule,
    ProviderSubscriptionModule,
    ScheduleModule.forRoot(),
    BookingRequestModule,
    UniversityModule
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
