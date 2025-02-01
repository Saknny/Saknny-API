import { Injectable, OnModuleInit } from '@nestjs/common';
import { get } from 'env-var';
import '@libs/utils/dotenv';
import Redis, { RedisOptions } from 'ioredis';
import * as Queue from 'bull';
import * as fastq from 'fastq';
import type { queueAsPromised, asyncWorker } from 'fastq';
import * as os from 'os';

@Injectable()
export class QueueService implements OnModuleInit {
  private queues: { [queueName: string]: any } = {};
  private redisConfig: RedisOptions;
  private hasRedis: boolean = false;
  private redisInitialized: Promise<void>;

  async onModuleInit() {
    await this.checkRedis();
  }

  async createQueue<Task>(
    queueName: string,
    bullQueueOptions?: Queue.QueueOptions,
    worker?: Function,
    concurrency: number = os.cpus().length,
  ): Promise<void> {
    if (this.queues[queueName]) return;
    let queue;

    if (this.hasRedis) {
      queue = new Queue(queueName, {
        redis: this.redisConfig,
        ...bullQueueOptions,
      });

      if (worker) {
        queue.process(async (job, done) => {
          try {
            await worker(job.data);
            done();
          } catch (err) {
            done(err);
          }
        });
      }
    } else {
      queue = fastq.promise(worker as asyncWorker<Task>, concurrency || 1);
    }
    this.queues[queueName] = queue;
  }

  async addToQueue(queueName: string, data: any, options?: any): Promise<void> {
    if (!this.queues[queueName]) throw new Error('Queue does not exist');

    if (this.hasRedis) {
      const queue = this.queues[queueName] as Queue.Queue;
      await queue.add(data, options);
    } else {
      const queue = this.queues[queueName] as fastq.queueAsPromised;
      queue.push(data);
    }
  }

  async checkRedis(): Promise<void> {
    this.redisConfig = this.getRedisConfig();
    if (!this.isRedisConfigValid()) return this.handleInvalidRedisConfig();

    const redisClient = new Redis(this.redisConfig);
    await this.initializeRedisClient(redisClient);
  }

  private getRedisConfig(): RedisOptions {
    return {
      host: get('REDIS_HOST').required().asString(),
      port: get('REDIS_PORT').required().asInt(),
      password: get('REDIS_PASS').asString(),
    };
  }

  private async initializeRedisClient(redisClient: Redis): Promise<void> {
    return new Promise<void>((resolve) => {
      redisClient
        .on('error', () => this.handleRedisConnectionChange(false, resolve))
        .on('connect', () => this.handleRedisConnectionChange(true, resolve));
    });
  }

  private isRedisConfigValid(): boolean {
    return Object.values(this.redisConfig).filter(Boolean).length >= 2;
  }

  private handleRedisConnectionChange(
    success: boolean,
    resolve: Function,
  ): void {
    this.hasRedis = success;
    if (!success) return resolve();
    console[success ? 'log' : 'error'](
      success
        ? 'Successfully connected to Redis'
        : 'Error connecting to Redis.',
    );
    resolve();
  }

  private handleInvalidRedisConfig(): void {
    this.hasRedis = false;
    console.warn('Redis Config was not satisfied; using in-memory caching.');
  }
}
