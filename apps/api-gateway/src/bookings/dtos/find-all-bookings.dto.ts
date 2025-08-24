import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsPositive } from 'class-validator';

export class FindAllBookingsDto {
  /**
   * Whether to fetch past or upcoming bookings
   * @example false
   */
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isPast?: boolean;

  /** Results per page
   * @example 10
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number;

  /** Page number
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number;
}
