import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { BookingsModule } from './bookings.module';
import { BOOKINGS_PACKAGE_NAME } from '@app/protos/generated/bookings';

const bootstrap = async () => {
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    BookingsModule,
    {
      transport: Transport.GRPC,
      options: {
        package: BOOKINGS_PACKAGE_NAME,
        protoPath: join(__dirname, '../../libs/protos/bookings.proto'),
        url: '0.0.0.0:5001',
      },
    },
  );

  const redisApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    BookingsModule,
    {
      transport: Transport.REDIS,
      options: {
        host: 'localhost',
        port: 6379,
      },
    },
  );

  await Promise.all([grpcApp.listen(), redisApp.listen()]);
};

void bootstrap();
