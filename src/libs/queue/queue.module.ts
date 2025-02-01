import { DynamicModule, Global, Module } from '@nestjs/common';
import { QueueService } from './queue.service';

@Global()
@Module({})
export class QueueModule {
  static async register(): Promise<DynamicModule> {
    const queueService = new QueueService();
    await queueService.checkRedis();

    return {
      module: QueueModule,
      providers: [{ provide: QueueService, useValue: queueService }],
      exports: [QueueService],
    };
  }
}
