import { Controller, Get } from '@nestjs/common';
import { GrpcOptions } from '@nestjs/microservices';
import {
  HealthCheck,
  HealthCheckService,
  GRPCHealthIndicator,
} from '@nestjs/terminus';

import {
  AUTH_PACKAGE_NAME,
  AUTH_SERVICE_NAME,
} from '@app/protos/generated/auth';
import {
  BOOKINGS_PACKAGE_NAME,
  BOOKINGS_SERVICE_NAME,
} from '@app/protos/generated/bookings';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly grpc: GRPCHealthIndicator,
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
    ]);
  }
}
