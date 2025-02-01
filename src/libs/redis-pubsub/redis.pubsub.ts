import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { get } from 'env-var';

@Injectable()
export class RedisPubSubService implements OnModuleDestroy {
  private activeSubscriptions: Map<
    string,
    Map<string, (channel: string, message: any) => void> 
  > = new Map();
  private redisSubscriber: Redis;
  private redisPublisher: Redis;

  constructor() {
    const redisHost = get('REDIS_HOST').asString() || 'localhost';
    const redisPort = parseInt(get('REDIS_PORT').asString() || '6379', 10);

    this.redisSubscriber = new Redis({ host: redisHost, port: redisPort });
    this.redisPublisher = new Redis({ host: redisHost, port: redisPort });


    this.redisSubscriber.on('message', (receivedChannel, message) => {
      const clientCallbacks = this.activeSubscriptions.get(receivedChannel);
      const parsedMessage = JSON.parse(message); // Ensure consistent parsing
      if (clientCallbacks) {
        clientCallbacks.forEach((cb) => cb(receivedChannel, parsedMessage));
      }
    });
  }


  subscribeToChannel(
    clientId: string,
    channel: string,
    callback: (channel: string, message: any) => void,
  ) {
    if (!this.activeSubscriptions.has(channel)) {
      this.activeSubscriptions.set(channel, new Map());
      this.redisSubscriber.subscribe(channel); // Subscribe once per channel
    }

    const clientCallbacks = this.activeSubscriptions.get(channel);
    if (!clientCallbacks.has(clientId)) {
      clientCallbacks.set(clientId, callback);
    }
  }


  unsubscribeFromAllChannels(clientId: string) {
    for (const channel of this.activeSubscriptions.keys()) {
      this.unsubscribeFromChannel(channel, clientId);
    }
  }


  unsubscribeFromChannel(channel: string, clientId: string) {
    const clientCallbacks = this.activeSubscriptions.get(channel);

    if (!clientCallbacks) return;

    clientCallbacks.delete(clientId);

    if (clientCallbacks.size === 0) {
      this.activeSubscriptions.delete(channel);

      // Delay unsubscribe slightly to ensure no race conditions
      setImmediate(() => {
        this.redisSubscriber.unsubscribe(channel);
      });
    }
  }


  publish(channel: string, message: any) {
    const serializedMessage = JSON.stringify(message);
    this.redisPublisher.publish(channel, serializedMessage);
  }


  onModuleDestroy() {
    this.redisSubscriber.disconnect();
    this.redisPublisher.disconnect();
  }
}
