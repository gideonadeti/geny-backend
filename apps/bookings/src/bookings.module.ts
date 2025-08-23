import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/bookings/.env',
    }),
  ],
  controllers: [BookingsController],
  providers: [BookingsService, PrismaService],
})
export class BookingsModule {}
