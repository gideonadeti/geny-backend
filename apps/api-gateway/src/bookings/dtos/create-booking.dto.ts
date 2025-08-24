import {
  Length,
  IsString,
  Matches,
  IsEnum,
  IsOptional,
  MaxLength,
  Validate,
} from 'class-validator';

import { LeadTimeValidator } from '../validators/lead-time-validator';
import { ServiceType } from 'apps/bookings/generated/prisma';

export class CreateBookingDto {
  /**
   * Client's full name (2-80 characters)
   * @example "John Doe"
   */
  @IsString()
  @Length(2, 80)
  clientName: string;

  /**
   * Client's phone number in E.164 format
   * @example "+12345678900"
   */
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'clientPhone must be a valid E.164 number',
  })
  clientPhone: string;

  /**
   * Type of service
   * @example "HAIRCUT"
   */
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  /**
   * Booking start time (must be at least 15 minutes from now)
   */
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
