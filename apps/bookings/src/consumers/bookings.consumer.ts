import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateRequest, ServiceType } from '@app/protos/generated/bookings';
import { ServiceType as PrismaServiceType } from 'apps/bookings/generated/prisma';
import { NotificationsGateway } from '../gateways/notifications.gateway';

@Processor('bookings', { concurrency: 2 })
export class BookingsConsumer extends WorkerHost {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {
    super();
  }

  private logger = new Logger(BookingsConsumer.name);

  private handleError(error: any, action: string) {
    this.logger.error(`Failed to ${action}`, (error as Error).stack);

    throw new InternalServerErrorException(`Failed to ${action}`);
  }

  async process(job: Job) {
    const createRequest = (job.data as { createRequest: CreateRequest })
      .createRequest;

    try {
      return await this.prismaService.booking.create({
        data: {
          ...createRequest,
          serviceType: ServiceType[
            createRequest.serviceType
          ] as PrismaServiceType,
          startsAt: createRequest.startsAt as Date,
        },
      });
    } catch (error) {
      this.handleError(error, 'process job');
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job, result: any) {
    this.logger.log(`Job with id ${job.id} completed`);

    const userId = (job.data as { createRequest: CreateRequest }).createRequest
      .userId;

    this.notificationsGateway.emitToUser(userId, 'booking.created', result);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job with id ${job.id} failed`, error.stack);

    const userId = (job.data as { createRequest: CreateRequest }).createRequest
      .userId;

    this.notificationsGateway.emitToUser(
      userId,
      'booking.creation.failed',
      error.message,
    );
  }
}
