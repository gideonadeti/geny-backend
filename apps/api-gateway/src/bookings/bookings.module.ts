import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BOOKINGS_PACKAGE_NAME } from '@app/protos/generated/bookings';

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
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
