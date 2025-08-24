import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { PrismaService } from './prisma/prisma.service';
import { AUTH_PACKAGE_NAME } from '@app/protos/generated/auth';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { BookingsConsumer } from './consumers/bookings.consumer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/bookings/.env',
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get<string>('REDIS_SERVICE_URL'),
        },
        defaultJobOptions: {
          attempts: 2,
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      }),
    }),
    BullModule.registerQueue({ name: 'bookings' }),
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
  ],
  controllers: [BookingsController],
  providers: [
    BookingsService,
    PrismaService,
    NotificationsGateway,
    BookingsConsumer,
  ],
})
export class BookingsModule {}
