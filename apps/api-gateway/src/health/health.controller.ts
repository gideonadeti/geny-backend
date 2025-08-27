import { Controller, Get, UseGuards } from '@nestjs/common';
import { GrpcOptions, Transport, RedisOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  GRPCHealthIndicator,
  MicroserviceHealthIndicator,
} from '@nestjs/terminus';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  AUTH_PACKAGE_NAME,
  AUTH_SERVICE_NAME,
  UserRole,
} from '@app/protos/generated/auth';
import {
  BOOKINGS_PACKAGE_NAME,
  BOOKINGS_SERVICE_NAME,
} from '@app/protos/generated/bookings';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly grpc: GRPCHealthIndicator,
    private readonly microservice: MicroserviceHealthIndicator,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () =>
        this.grpc.checkService<GrpcOptions>(
          AUTH_PACKAGE_NAME,
          AUTH_SERVICE_NAME,
          {
            url: this.configService.get<string>('AUTH_SERVICE_URL'),
          },
        ),
      async () =>
        this.grpc.checkService<GrpcOptions>(
          BOOKINGS_PACKAGE_NAME,
          BOOKINGS_SERVICE_NAME,
          {
            url: this.configService.get<string>('BOOKINGS_SERVICE_URL'),
          },
        ),
      async () =>
        this.microservice.pingCheck<RedisOptions>('redis', {
          transport: Transport.REDIS,
          options: {
            host: 'localhost',
            port: 6379,
          },
        }),
    ]);
  }
}
