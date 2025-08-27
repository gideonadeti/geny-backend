import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';

import { PrismaService } from '../prisma/prisma.service';
import {
  HEALTH_SERVICE_NAME,
  ServingStatus,
} from '@app/protos/generated/health';

@Controller()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  private logger = new Logger(HealthController.name);

  @GrpcMethod(HEALTH_SERVICE_NAME)
  async check() {
    try {
      await this.health.check([
        async () => this.prismaHealth.pingCheck('database', this.prisma),
      ]);

      return {
        status: ServingStatus.SERVING,
      };
    } catch (error) {
      this.logger.error(`Failed to check health`, (error as Error).stack);

      return {
        status: ServingStatus.NOT_SERVING,
      };
    }
  }
}
