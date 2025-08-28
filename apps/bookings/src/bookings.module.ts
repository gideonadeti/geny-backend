import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'API-GATEWAY_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: configService.get<string>('REDIS_HOST', 'redis'),
            port: parseInt(configService.get<string>('REDIS_PORT', '6379'), 10),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'redis'),
          port: parseInt(configService.get<string>('REDIS_PORT', '6379'), 10),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: 'reminders' }),
    HealthModule,
    PrismaModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService, RemindersConsumer],
})
export class BookingsModule {}
