import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {NbToastrService} from '@nebular/theme';
import {WebsocketService} from '../@core/services/websocket.service';
import {takeWhile} from 'rxjs';
import {NativeClientInterface} from '../@core/interfaces/native-client.interface';
import {WebsocketPayloadInterface} from '../@core/interfaces/websocket-payload.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  clients: NativeClientInterface[] = [];
  inputFC = new FormControl('', Validators.required);
  alive = true;



  constructor(private toastrService: NbToastrService, private webSocketService: WebsocketService) { }

  ngOnInit() {
    this.webSocketService.messagesSubject$.pipe(takeWhile(() => this.alive)).subscribe((msg) => this.handleMsg(msg));
    // get all native clients when initializing on demand
    this.webSocketService.sendMsg({ type: 'getNativeClients', payload: {} }, 'getNativeClients');
  }

  ngOnDestroy() {
    this.alive = false;
  }

  /**
   * send message to websocket
   * @param message - message to send
   */
  sendMsg(message: string) {
    // send info to websocket
    this.webSocketService.sendMsg({ type: 'sendToNative', payload: { lastSentMessage: message } });
    this.toastrService.success('Nachricht gesendet', 'Erfolg');
  }

  /**
   * handle incoming messages
   * @param msg - incoming message
   */
  handleMsg(msg: WebsocketPayloadInterface<NativeClientInterface[]> | WebsocketPayloadInterface<NativeClientInterface>) {
    switch (msg.type) {
      case 'message':
        // update specific client with last sent message
        if (!Array.isArray(msg.payload)) {
          const parsedMsg: NativeClientInterface = msg.payload as NativeClientInterface;
          this.clients.find((client) => client.socketId === parsedMsg.socketId).lastSentMessage = parsedMsg.lastSentMessage;
        }
        break;
      case 'nativeClients':
        this.clients = msg.payload as NativeClientInterface[];
        break;
    }
  }
}
