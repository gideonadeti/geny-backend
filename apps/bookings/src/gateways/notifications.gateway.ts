import { Logger, UseGuards } from '@nestjs/common';
import { Server } from 'socket.io';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { WsAuthGuard } from '../guards/ws-auth.guard';
import { WsClient } from '@app/interfaces';

@WebSocketGateway()
@UseGuards(WsAuthGuard)
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private userSocketMap = new Map<string, string>();
  private logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: WsClient) {
    const userId = client.user.sub;

    this.userSocketMap.set(userId, client.id);
    this.logger.log(`Client with id ${client.id} connected`);
  }

  handleDisconnect(client: WsClient) {
    const userId = client.user.sub;

    this.userSocketMap.delete(userId);
    this.logger.log(`Client with id ${client.id} disconnected`);
  }

  emitToUser(userId: string, event: string, payload: any) {
    const socketId = this.userSocketMap.get(userId);

    if (socketId) {
      this.server.to(socketId).emit(event, payload);
    }
  }
}
