import { GrpcError } from '@app/interfaces';
import {
  AUTH_PACKAGE_NAME,
  AUTH_SERVICE_NAME,
  AuthServiceClient,
} from '@app/protos/generated/auth';
import {
  BOOKINGS_PACKAGE_NAME,
  BOOKINGS_SERVICE_NAME,
  BookingsServiceClient,
} from '@app/protos/generated/bookings';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MetricsService implements OnModuleInit {
  constructor(
    @Inject(BOOKINGS_PACKAGE_NAME) private bookingsClient: ClientGrpc,
    @Inject(AUTH_PACKAGE_NAME) private authClient: ClientGrpc,
  ) {}

  private logger = new Logger(MetricsService.name);
  private bookingsService: BookingsServiceClient;
  private authService: AuthServiceClient;

  onModuleInit() {
    this.authService = this.authClient.getService(AUTH_SERVICE_NAME);
    this.bookingsService = this.bookingsClient.getService(
      BOOKINGS_SERVICE_NAME,
    );
  }

  private handleError(error: any, action: string) {
    this.logger.error(`Failed to ${action}`, (error as GrpcError).stack);

    throw new InternalServerErrorException(`Failed to ${action}`);
  }

  async findProvidersCount() {
    try {
      return await firstValueFrom(this.authService.findProvidersCount({}));
    } catch (error) {
      this.handleError(error, 'find providers count');
    }
  }

  async findBookingsCount() {
    try {
      return await firstValueFrom(this.bookingsService.findBookingsCount({}));
    } catch (error) {
      this.handleError(error, 'find bookings count');
    }
  }
}
