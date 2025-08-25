import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';

import { CreateBookingDto } from './dtos/create-booking.dto';
import { GrpcError, MicroserviceError } from '@app/interfaces';
import { FindAllBookingsDto } from './dtos/find-all-bookings.dto';
import { NotificationsGateway } from './gateways/notifications.gateway';
import {
  Booking,
  BOOKINGS_PACKAGE_NAME,
  BOOKINGS_SERVICE_NAME,
  BookingsServiceClient,
  ServiceType,
} from '@app/protos/generated/bookings';

@Injectable()
export class BookingsService implements OnModuleInit {
  constructor(
    @Inject(BOOKINGS_PACKAGE_NAME) private bookingsClient: ClientGrpc,
    @Inject('BOOKINGS_SERVICE') private bookingsAsyncClient: ClientProxy,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  private bookingService: BookingsServiceClient;
  private logger = new Logger(BookingsService.name);

  onModuleInit() {
    this.bookingService = this.bookingsClient.getService(BOOKINGS_SERVICE_NAME);
  }

  private handleError(error: any, action: string) {
    this.logger.error(`Failed to ${action}`, (error as GrpcError).stack);

    const microserviceError = JSON.parse(
      (error as GrpcError).details || '{}',
    ) as MicroserviceError;

    if (microserviceError.name === 'NotFoundException') {
      throw new NotFoundException(microserviceError.message);
    }

    throw new InternalServerErrorException(`Failed to ${action}`);
  }

  create(userId: string, createBookingDto: CreateBookingDto) {
    try {
      this.bookingsAsyncClient.emit('create-booking', {
        ...createBookingDto,
        userId,
        serviceType: ServiceType[createBookingDto.serviceType],
      });

      return { started: true };
    } catch (error) {
      this.handleError(error, 'create booking');
    }
  }

  async findAll(userId: string, query: FindAllBookingsDto) {
    const { page, limit } = query;

    try {
      const findAllResponse = await firstValueFrom(
        this.bookingService.findAll({
          ...query,
          userId,
        }),
      );

      if (!page && !limit) {
        return (findAllResponse.bookings || []).map((b) => ({
          ...b,
          serviceType: ServiceType[b.serviceType],
        }));
      }

      return {
        ...findAllResponse,
        bookings: (findAllResponse.bookings || []).map((b) => ({
          ...b,
          serviceType: ServiceType[b.serviceType],
        })),
      };
    } catch (error) {
      this.handleError(error, 'fetch bookings');
    }
  }

  async findOne(id: string) {
    try {
      const findOneResponse = await firstValueFrom(
        this.bookingService.findOne({ id }),
      );

      return {
        ...findOneResponse,
        serviceType: ServiceType[findOneResponse.serviceType],
      };
    } catch (error) {
      this.handleError(error, 'fetch booking');
    }
  }

  handleCreateBookingCompleted(data: Booking) {
    this.notificationsGateway.emitToUser(
      data.userId,
      'booking.completed',
      data,
    );
  }
}
