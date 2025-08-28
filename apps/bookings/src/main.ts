import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

import { BookingsModule } from './bookings.module';
import { BOOKINGS_PACKAGE_NAME } from '@app/protos/generated/bookings';
import { GRPC_HEALTH_V1_PACKAGE_NAME } from '@app/protos/generated/health';

const bootstrap = async () => {
  const app = await NestFactory.create(BookingsModule);
  const configService = app.get(ConfigService);

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
        host: configService.get<string>('REDIS_HOST', 'redis'),
        port: parseInt(configService.get<string>('REDIS_PORT', '6379'), 10),
      },
    },
  );

  await Promise.all([grpcApp.listen(), redisApp.listen()]);
};

void bootstrap();
