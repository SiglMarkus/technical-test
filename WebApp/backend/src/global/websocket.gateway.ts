import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { MyLogger } from './custom-logger';
import { WsGuard } from './ws-auth.guard';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { ClientStoreInterface } from './interfaces/client-store.interface';
import { WebSocketPayload } from './interfaces/web-socket-payload.interface';

@WebSocketGateway({
  transports: ['polling', 'websocket'],
  origins: '*:*',
  cors: {
    origin: '*',
  },
  handlePreflightRequest: (req, res) => {
    const headers = {
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Origin': req.headers.origin, //or the specific origin you want to give access to,
      'Access-Control-Allow-Credentials': true,
    };
    res.writeHead(200, headers);
    res.end();
  },
})
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new MyLogger('Websocket');
  private clientStore: ClientStoreInterface[] = []; // contains all connected clients

  constructor() {}

  afterInit(server: Server) {
    this.server = server;
    this.logger.log('Init');
  }

  /**
   * handle disconnects
   * @param socket
   */
  @UseGuards(WsGuard)
  async handleDisconnect(socket: Socket) {
    this.logger.log(`Socket disconnected: ${socket.id}`);
    // remove connection from clientStore
    this.clientStore = this.clientStore.filter((entry) => entry.socket.id !== socket.id);
    this.notifyWebClientsAboutNativeClients();
  }

  /**
   * handle new connections
   * @param {Socket} socket
   * @param args
   * @returns {Promise<void>}
   */
  @UseGuards(WsGuard)
  async handleConnection(socket: Socket, ...args: any[]) {
    try {
      this.clientStore.push({
        socket,
        socketId: socket.id,
        type: (socket.client.request.headers.from as 'web' | 'native') ?? 'native', // default native
      });
      this.logger.log(`Client connected: ${socket.id} | ${socket.client.conn.remoteAddress} | ${socket.client.request.headers.from}`);
    } catch (e) {}

    //  in case of native client we update all web clients with the new native client list (probably multiple ones)
    if (socket.client.request.headers.from == null || socket.client.request.headers.from === 'native') {
      this.notifyWebClientsAboutNativeClients();
    }
  }

  /**
   * Handles all incoming messages
   * @param {Socket} socket
   * @param {WebSocketPayload<any>} data
   * @returns {Promise<void>}
   */
  @UseGuards(WsGuard)
  @SubscribeMessage('event')
  async handleMessage(socket: Socket, data: WebSocketPayload<any>) {
    this.logger.log(`Received: ${JSON.stringify(data)}`);
    // add data to socket object in our clientStore
    this.addLastSentMessageToSocket(socket, data);
    const payload = {
      type: 'message',
      payload: {
        socketId: socket.id,
        lastSentMessage: data.payload.lastSentMessage,
      } as Partial<ClientStoreInterface>,
    };

    if (data.type === 'sendToNative') {
      this.sendToNativeClients(payload);
    } else if (data.type === 'sendToWeb') {
      this.sendToWebClients(payload);
    }
  }

  /**
   * Returns all connected native clients
   * @param socket
   * @param data
   */
  @SubscribeMessage('getNativeClients')
  async requestNativeClients(socket: Socket, data: WebSocketPayload<any>): Promise<void> {
    this.logger.log(`Received: ${JSON.stringify(data)}`);
    const payload = {
      type: 'nativeClients',
      payload: this.getNativeClients(),
    };
    this.sendClientMessage(socket, payload);
  }

  /**
   * Sends to all connected native clients
   * @param data
   */
  async sendToNativeClients<T>(data: Partial<WebSocketPayload<T>>): Promise<void> {
    this.logger.log(`Send to native clients: ${JSON.stringify(data)}`);
    this.clientStore.forEach((client) => {
      if (client.type === 'native') {
        this.sendClientMessage(client.socket, data);
      }
    });
  }

  /**
   * sends to all connected web clients
   * @param data
   */
  async sendToWebClients<T>(data: Partial<WebSocketPayload<T>>): Promise<void> {
    this.logger.log(`Send to web clients: ${JSON.stringify(data)}`);
    this.clientStore.forEach((client) => {
      if (client.type === 'web') {
        this.sendClientMessage(client.socket, data);
      }
    });
  }

  /**
   * Only sends data to client specified in the socket
   * @param socket | Socket object
   * @param data   | data we want to sent
   * @param eventName | Event Name
   */
  async sendClientMessage<T>(socket: Socket, data: Partial<WebSocketPayload<T>>, eventName = 'event'): Promise<void> {
    socket.emit(eventName, data);
  }

  /**
   * Sends to all connected clients
   * @param data | WebSocketPayload
   */
  @OnEvent('emit.event.global')
  async sendGlobalMessage(data: WebSocketPayload<any>): Promise<void> {
    // this.logger.log('Send Global ' + JSON.stringify(data));
    this.server.emit('event', { type: data.type, payload: data.payload });
  }

  /**
   * Sends to all connected web clients the current native client list
   */
  notifyWebClientsAboutNativeClients(): void {
    const nativeClients = this.getNativeClients();
    // update all webclients with updated native client list
    this.sendToWebClients({
      type: 'nativeClients',
      payload: nativeClients,
    });
  }

  /**
   * Returns all connected native clients
   * @returns {Partial<ClientStoreInterface>[]}
   */
  getNativeClients(): Partial<ClientStoreInterface>[] {
    return this.clientStore
      .filter((client) => client.type === 'native')
      .map((client) => {
        return {
          socketId: client.socket.id,
          lastSentMessage: client.lastSentMessage,
        };
      });
  }

  /**
   * Adds the last sent message to the socket object in our clientStore
   * @param socket
   * @param data
   */
  addLastSentMessageToSocket(socket: Socket, data: WebSocketPayload<any>): void {
    const client = this.clientStore.find((entry) => entry.socket.id === socket.id);
    client.lastSentMessage = data.payload.lastSentMessage;
  }
}
