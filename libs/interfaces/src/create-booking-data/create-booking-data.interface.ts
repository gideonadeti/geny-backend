import { ServiceType } from '@app/protos/generated/bookings';

export interface CreateBookingData {
  userId: string;
  clientName: string;
  clientPhone: string;
  serviceType: ServiceType;
  startsAt: Date;
  notes?: string;
}
