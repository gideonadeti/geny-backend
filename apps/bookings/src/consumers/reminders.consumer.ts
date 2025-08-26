import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';

import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Processor('reminders', { concurrency: 2 })
export class RemindersConsumer extends WorkerHost {
  constructor(
    @Inject('API-GATEWAY_SERVICE')
    private readonly apiGatewayClient: ClientProxy,
  ) {
    super();
  }

  private logger = new Logger(RemindersConsumer.name);

  async process(job: Job) {
    const userId = job.data as string;

    this.logger.log(`Sending reminder to user with id ${userId}`);

    try {
      await firstValueFrom(this.apiGatewayClient.emit('send-reminder', userId));
    } catch (error) {
      this.logger.error(
        `Failed to send reminder to user with id ${userId}`,
        (error as Error).stack,
      );

      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job with id ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job with id ${job.id} failed`, error.stack);
  }
}
