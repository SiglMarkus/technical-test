import { Socket } from 'socket.io';

export interface ClientStoreInterface {
  type: 'web' | 'native';
  lastSentMessage?: string;
  socket: Socket;
  socketId: string;
}
