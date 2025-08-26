import { Controller } from '@nestjs/common';
import { EventPattern, GrpcMethod } from '@nestjs/microservices';

import { BookingsService } from './bookings.service';
import { CreateBookingData } from '@app/interfaces';
import {
  BOOKINGS_SERVICE_NAME,
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

  @EventPattern('create-booking')
  handleCreateBooking(data: CreateBookingData) {
    return this.bookingsService.handleCreateBooking(data);
  }

  @EventPattern('set-reminder')
  handleSetReminder(data: { userId: string; startsAt: Date }) {
    return this.bookingsService.handleSetReminder(data);
  }
}
