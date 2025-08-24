import { firstValueFrom } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import { WsClient } from '@app/interfaces';
import {
  AUTH_PACKAGE_NAME,
  AUTH_SERVICE_NAME,
  AuthServiceClient,
} from '@app/protos/generated/auth';

@Injectable()
export class WsAuthGuard implements OnModuleInit, CanActivate {
  constructor(
    @Inject(AUTH_PACKAGE_NAME) private readonly authClient: ClientGrpc,
  ) {}

  private authService: AuthServiceClient;
  private logger = new Logger(WsAuthGuard.name);

  onModuleInit() {
    this.authService = this.authClient.getService(AUTH_SERVICE_NAME);
  }

  async canActivate(context: ExecutionContext) {
    const client = context.switchToWs().getClient<WsClient>();
    const authHeader = client.handshake.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return false;
    }

    try {
      const validateTokenResponse = await firstValueFrom(
        this.authService.validateToken({ token }),
      );

      client.user = validateTokenResponse;

      return true;
    } catch (error) {
      this.logger.error('Failed to validate token', (error as Error).stack);

      return false;
    }
  }
}
