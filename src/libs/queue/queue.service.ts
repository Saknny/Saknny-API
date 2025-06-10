import '@libs/utils/dotenv';
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Queue from 'bull';
import { log } from 'console';
import { get } from 'env-var';
import type { asyncWorker } from 'fastq';
import * as fastq from 'fastq';
import * as Redis from 'ioredis';
import * as os from 'os';
@Injectable()
export class QueueService implements OnModuleInit {
  onModuleInit() {
    this.chechRedis();
  }
  private queues: { [queueName: string]: any } = {};
  private redisConfig: Redis.RedisOptions;
  private hasRedis: boolean = false;
  createQueue<Task>(
    queueName: string,
    bullQueueOptions?: Queue.QueueOptions,
    worker?: Function,
    concurrency: number = os.cpus.length,
  ): void {
    this.chechRedis();
    log('worker', worker.name);
    let queue;
    if (this.queues[queueName]) return;
    if (this.hasRedis) {
      queue = new Queue(queueName, bullQueueOptions);
      if (worker) {
        queue.process((job, done) => {
          // log('process', job);
          worker(job.data);
          done();
        });
      }
    } else {
      queue = fastq.promise(worker as asyncWorker<Task>, concurrency || 1);
    }
    this.queues[queueName] = queue;
  }

  async addToQueue(queueName: string, data: any, options?: any): Promise<void> {
    if (!this.queues[queueName]) throw new Error('Queue does not exists');
    if (this.hasRedis) {
      const queue = this.queues[queueName] as Queue.Queue;
      queue.add(data, options);
    } else {
      const queue = this.queues[queueName] as fastq.queueAsPromised;
      console.log('queue ---------------> ', queue);

      queue.push(data);
    }
  }

  //TODO: implement these
  addWorkerToQueue(worker: Function): void {}

  delayAProcess(queueName: string, processId: any): void {}

  removeFromQueue(queueName: string, processId: string): void {}

  private chechRedis() {
    try {
      //TODO: add it in the cache configs
      this.redisConfig = {
        host: get('REDIS_HOST').required().asString(),
        port: get('REDIS_PORT').required().asInt(),
        password: get('REDIS_PASS').asString(),
      };
      if (Object.values(this.redisConfig).filter(Boolean).length < 2) {
        console.warn(
          '>>>>>>> Redis Config was not satisfied using in memory cashing ....',
        );
        this.hasRedis = false;
      }
      this.hasRedis = true;
    } catch (error) {
      console.warn(
        '>>>>>>> Redis Config was not satisfied using in memory cashing ....',
      );
      this.hasRedis = false;
    }
  }
}
