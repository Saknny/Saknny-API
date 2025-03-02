import { Global, Module } from '@nestjs/common';
import { QueueService } from './queue.service';

@Global()
@Module({
  imports: [],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
