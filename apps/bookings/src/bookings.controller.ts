import { Controller, Get } from '@nestjs/common';
import { BookingsService } from './bookings.service';

@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  getHello(): string {
    return this.bookingsService.getHello();
  }
}
