import {
  Length,
  IsString,
  Matches,
  IsEnum,
  IsOptional,
  MaxLength,
  Validate,
  IsNotEmpty,
} from 'class-validator';

import { LeadTimeValidator } from '../validators/lead-time-validator';
import { ServiceType } from 'apps/bookings/generated/prisma';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  /**
   * Client's full name (2-80 characters)
   * @example "John Doe"
   */
  @IsNotEmpty()
  @IsString()
  @Length(2, 80)
  clientName: string;

  /**
   * Client's phone number in E.164 format
   * @example "+12345678900"
   */
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'clientPhone must be a valid E.164 number',
  })
  clientPhone: string;

  /**
   * Type of service
   * @example "HAIRCUT"
   */
  @IsNotEmpty()
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  /**
   * Booking start time (must be at least 15 minutes from now)
   */
  @IsNotEmpty()
  @Type(() => Date)
  @Validate(LeadTimeValidator)
  startsAt: Date;

  /**
   * Optional notes for the booking (max 280 characters)
   * @example "Client prefers a window seat"
   */
  @IsOptional()
  @IsString()
  @MaxLength(280)
  notes?: string;
}
