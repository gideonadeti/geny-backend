import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BOOKINGS_PACKAGE_NAME } from '@app/protos/generated/bookings';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { AUTH_PACKAGE_NAME } from '@app/protos/generated/auth';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: BOOKINGS_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: BOOKINGS_PACKAGE_NAME,
            protoPath: join(__dirname, '../../libs/protos/bookings.proto'),
            url: configService.get('BOOKINGS_SERVICE_URL') as string,
          },
        }),
        inject: [ConfigService],
      },
    ]),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: AUTH_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: AUTH_PACKAGE_NAME,
            protoPath: join(__dirname, '../../libs/protos/auth.proto'),
            url: configService.get<string>('AUTH_SERVICE_URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    ClientsModule.register([
      {
        name: 'BOOKINGS_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: 'redis',
          port: 6379,
        },
      },
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService, NotificationsGateway],
})
export class BookingsModule {}
