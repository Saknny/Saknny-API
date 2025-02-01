import { Global, Module } from '@nestjs/common';
import { RedisPubSubService } from './redis.pubsub';

@Global()
@Module({
  providers: [RedisPubSubService],
  exports: [RedisPubSubService],
})
export class PubSubModule {}
