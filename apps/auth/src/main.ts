import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { AuthModule } from './auth.module';
import { AUTH_PACKAGE_NAME } from '@app/protos/generated/auth';
import { GRPC_HEALTH_V1_PACKAGE_NAME } from '@app/protos/generated/health';

const bootstrap = async () => {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.GRPC,
      options: {
        package: [AUTH_PACKAGE_NAME, GRPC_HEALTH_V1_PACKAGE_NAME],
        protoPath: [
          join(process.cwd(), 'libs/protos/src/auth.proto'),
          join(process.cwd(), 'libs/protos/src/health.proto'),
        ],
        url: '0.0.0.0:5000',
      },
    },
  );

  await app.listen();
};

void bootstrap();
