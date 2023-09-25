import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WebsocketPayloadInterface } from '../interfaces/websocket-payload.interface';
import { io } from 'socket.io-client';
import { Socket } from 'ngx-socket-io';

/**
 * Service which handles our websocket connection and exposes a messagesSubject object
 */
@Injectable({
  providedIn: 'root',
})
export class WebsocketService implements OnDestroy {
  private socket: Socket;
  private alive = true;
  private currentBearerToken = ''; // TODO add bearer Token setup
  messagesSubject$: Subject<WebsocketPayloadInterface<any>> = new Subject();
  private connected = false;
  private triedToSetupConnection = false;

  constructor() {
    if (!this.triedToSetupConnection) {
      this.setupConnection();
      this.triedToSetupConnection = true;
    }
  }

  /**
   * this function sets up the connection and the handler for events
   */
  setupConnection() {
    this.socket = io(environment.socketUrl, {
      secure: environment.production,
      transportOptions: {
        polling: {
          extraHeaders: {
            from: 'web',
            Authorization: `Bearer ${this.currentBearerToken}`,
          },
        },
      },
    }) as any;
    // setup handler for events
    this.socket.on('connect', () => {
      this.connected = true;
    });
    this.socket.on('event', (data) => this.handleMsg(data));
  }

  /**
   * Msg to the backend
   * @param msg | JSON to send to the backend
   * @param eventName | Eventname for our backend
   */
  sendMsg(msg: WebsocketPayloadInterface<any>, eventName = 'event') {
    console.log(`[WEBSOCKET - SENT]`, msg);
    this.socket.emit(eventName, msg);
  }

  /**
   * This function handles our messages from our backend
   * @param msg | JSON
   */
  handleMsg(msg: WebsocketPayloadInterface<any>) {
    console.log(`[WEBSOCKET - RECEIVED]`, msg);
    this.messagesSubject$.next(msg);
  }

  /**
   * disconnects the socket and sets the 'connected' variable to false
   */
  closeConnection() {
    try {
      this.socket.disconnect();
      this.connected = false;
    } catch (e) {}
  }

  ngOnDestroy() {
    this.closeConnection();
    this.alive = false;
  }
}
