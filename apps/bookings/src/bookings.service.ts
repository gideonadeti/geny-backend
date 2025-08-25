import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import { PrismaService } from './prisma/prisma.service';
import { ServiceType as PrismaServiceType } from '../generated/prisma';
import { FindAllRequest, ServiceType } from '@app/protos/generated/bookings';
import { CreateBookingData } from '@app/interfaces';

@Injectable()
export class BookingsService {
  constructor(
    private prismaService: PrismaService,
    @Inject('API-GATEWAY_SERVICE')
    private readonly apiGatewayClient: ClientProxy,
  ) {}

  private logger = new Logger(BookingsService.name);

  private handleError(error: any, action: string) {
    this.logger.error(`Failed to ${action}`, (error as Error).stack);

    throw new RpcException(JSON.stringify(error));
  }

  async findAll(findAllRequest: FindAllRequest) {
    const { userId, isPast, limit, page } = findAllRequest;

    try {
      if (!page && !limit) {
        const bookings = await this.prismaService.booking.findMany({
          where: {
            userId,
            ...(isPast !== undefined && {
              startsAt: {
                ...(isPast ? { lt: new Date() } : { gte: new Date() }),
              },
            }),
          },
        });

        return {
          bookings,
          meta: {},
        };
      }

      const total = await this.prismaService.booking.count({
        where: {
          userId,
          ...(isPast !== undefined && {
            startsAt: {
              ...(isPast ? { lt: new Date() } : { gte: new Date() }),
            },
          }),
        },
      });

      const numberPage = page || 1;
      const numberLimit = limit || 10;
      const lastPage = Math.ceil(total / numberLimit) || 1;
      const bookings = await this.prismaService.booking.findMany({
        where: {
          userId,
          ...(isPast !== undefined && {
            startsAt: {
              ...(isPast ? { lt: new Date() } : { gte: new Date() }),
            },
          }),
        },
        skip: (numberPage - 1) * numberLimit,
        take: numberLimit,
      });

      return {
        bookings,
        meta: {
          total,
          currentPage: numberPage,
          lastPage,
          hasNextPage: numberPage < lastPage,
          hasPreviousPage: numberPage > 1,
        },
      };
    } catch (error) {
      this.handleError(error, 'fetch bookings');
    }
  }

  async findOne(id: string) {
    try {
      const booking = await this.prismaService.booking.findUnique({
        where: { id },
      });

      if (!booking) {
        throw new NotFoundException(`Booking with id ${id} not found`);
      }

      return booking;
    } catch (error) {
      this.handleError(error, `fetch booking with id ${id}`);
    }
  }

  async handleCreateBooking(data: CreateBookingData) {
    try {
      const booking = await this.prismaService.booking.create({
        data: {
          ...data,
          serviceType: ServiceType[data.serviceType] as PrismaServiceType,
        },
      });

      this.apiGatewayClient.emit('create-booking-completed', booking);
    } catch (error) {
      this.handleError(error, 'handle booking started event');
    }
  }
}
