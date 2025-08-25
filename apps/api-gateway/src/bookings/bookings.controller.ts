import { ApiBearerAuth } from '@nestjs/swagger';
import { EventPattern } from '@nestjs/microservices';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';

import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { FindAllBookingsDto } from './dtos/find-all-bookings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from '../auth/decorators/user-id.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@app/protos/generated/auth';
import { Roles } from '../auth/decorators/roles.decorator';
import { Booking } from '@app/protos/generated/bookings';
import { Public } from '../auth/decorators/public.decorator';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PROVIDER)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@UserId() userId: string, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(userId, createBookingDto);
  }

  @Get()
  findAll(@UserId() userId: string, @Query() query: FindAllBookingsDto) {
    return this.bookingsService.findAll(userId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Public()
  @EventPattern('booking.completed')
  handleBookingCompleted(data: Booking) {
    return this.bookingsService.handleBookingCompleted(data);
  }
}
