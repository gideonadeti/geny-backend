import { Controller } from '@nestjs/common';
import { EventPattern, GrpcMethod } from '@nestjs/microservices';

import { BookingsService } from './bookings.service';
import {
  BOOKINGS_SERVICE_NAME,
  CreateRequest,
  FindAllRequest,
  FindOneRequest,
} from '@app/protos/generated/bookings';

@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @GrpcMethod(BOOKINGS_SERVICE_NAME)
  findAll(data: FindAllRequest) {
    return this.bookingsService.findAll(data);
  }

  @GrpcMethod(BOOKINGS_SERVICE_NAME)
  findOne(data: FindOneRequest) {
    return this.bookingsService.findOne(data.id);
  }

  @EventPattern('booking.started')
  handleBookingStarted(data: CreateRequest) {
    return this.bookingsService.handleBookingStarted(data);
  }
}
