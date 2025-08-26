import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import {
  HEALTH_SERVICE_NAME,
  ServingStatus,
} from '@app/protos/generated/health';

@Controller()
export class HealthController {
  @GrpcMethod(HEALTH_SERVICE_NAME)
  check() {
    return {
      status: ServingStatus.SERVING,
    };
  }
}
