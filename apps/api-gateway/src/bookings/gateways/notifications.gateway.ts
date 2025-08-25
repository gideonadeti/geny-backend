import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import { Server } from 'socket.io';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { AuthSocket } from '@app/interfaces';
import {
  AUTH_PACKAGE_NAME,
  AUTH_SERVICE_NAME,
  AuthServiceClient,
} from '@app/protos/generated/auth';

@WebSocketGateway()
export class NotificationsGateway
  implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(AUTH_PACKAGE_NAME) private readonly authClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authService = this.authClient.getService(AUTH_SERVICE_NAME);
  }

  @WebSocketServer()
  server: Server;

  private authService: AuthServiceClient;
  private logger = new Logger(NotificationsGateway.name);
  private userSocketMap = new Map<string, string>();

  private async validateClient(client: AuthSocket) {
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

  async handleConnection(client: AuthSocket) {
    this.logger.log(`Client with id ${client.id} is connecting...`);

    try {
      const isAuthenticated = await this.validateClient(client);

      if (!isAuthenticated) {
        this.logger.warn(
          `Client with id ${client.id} is unauthenticated. Disconnecting...`,
        );

        client.disconnect();

        return;
      }

      const user = client.user as { sub: string };

      this.userSocketMap.set(user.sub, client.id);
      this.logger.log(`User with id ${user.sub} connected`);

      const mapValues = Array.from(this.userSocketMap.entries());

      this.logger.debug(
        `Current user-socket map: ${JSON.stringify(mapValues)}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to authenticate client with id ${client.id}`,
        (error as Error).stack,
      );

      client.disconnect();

      return;
    }
  }

  handleDisconnect(client: AuthSocket) {
    if (client.user) {
      this.userSocketMap.delete(client.user.sub);
    }

    this.logger.log(`Client with id ${client.id} disconnected`);
  }

  emitToUser(userId: string, event: string, payload: any) {
    const socketId = this.userSocketMap.get(userId);

    this.logger.log(`Emitting event ${event} to user with id ${userId}`);
    this.logger.log(`Socket id: ${socketId}`);

    const mapValues = Array.from(this.userSocketMap.entries());

    this.logger.debug(`Current user-socket map: ${JSON.stringify(mapValues)}`);

    if (socketId) {
      this.server.to(socketId).emit(event, payload);
    }
  }
}
