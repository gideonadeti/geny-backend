import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { BullModule } from '@nestjs/bullmq';

import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { AUTH_PACKAGE_NAME } from '@app/protos/generated/auth';
import { RemindersConsumer } from './consumers/reminders.consumer';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/bookings/.env',
    }),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: AUTH_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: AUTH_PACKAGE_NAME,
            protoPath: join(process.cwd(), 'libs/protos/src/auth.proto'),
            url: configService.get<string>('AUTH_SERVICE_URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    ClientsModule.register([
      {
        name: 'API-GATEWAY_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: 'redis',
          port: 6379,
        },
      },
    ]),
    BullModule.forRoot({
      connection: {
        host: 'redis',
        port: 6379,
      },
    }),
    BullModule.registerQueue({ name: 'reminders' }),
    HealthModule,
    PrismaModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService, RemindersConsumer],
})
export class BookingsModule {}
