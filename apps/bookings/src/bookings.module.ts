import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BullModule } from '@nestjs/bullmq';

import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { RemindersConsumer } from './consumers/reminders.consumer';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/bookings/.env',
    }),
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
