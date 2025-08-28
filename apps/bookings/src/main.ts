import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { BookingsModule } from './bookings.module';
import { BOOKINGS_PACKAGE_NAME } from '@app/protos/generated/bookings';
import { GRPC_HEALTH_V1_PACKAGE_NAME } from '@app/protos/generated/health';

const bootstrap = async () => {
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    BookingsModule,
    {
      transport: Transport.GRPC,
      options: {
        package: [BOOKINGS_PACKAGE_NAME, GRPC_HEALTH_V1_PACKAGE_NAME],
        protoPath: [
          join(process.cwd(), 'libs/protos/src/bookings.proto'),
          join(process.cwd(), 'libs/protos/src/health.proto'),
        ],
        url: '0.0.0.0:5001',
      },
    },
  );

  const redisApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    BookingsModule,
    {
      transport: Transport.REDIS,
      options: {
        host: 'redis',
        port: 6379,
      },
    },
  );

  await Promise.all([grpcApp.listen(), redisApp.listen()]);
};

void bootstrap();
