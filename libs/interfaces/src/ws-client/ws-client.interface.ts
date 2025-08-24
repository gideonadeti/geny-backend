import { Socket } from 'socket.io';

export interface WsClient extends Socket {
  user: { sub: string };
}
