import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  NbThemeModule,
  NbLayoutModule,
  NbContextMenuModule,
  NbActionsModule,
  NbMenuModule,
  NbToastrModule,
  NbSelectWithAutocompleteModule, NbIconModule, NbFormFieldModule
} from '@nebular/theme';
import {environment} from '../environments/environment';
import {SocketIoModule} from 'ngx-socket-io';
import {NbEvaIconsModule} from '@nebular/eva-icons';
import {WebsocketService} from './@core/services/websocket.service';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NbThemeModule.forRoot({name: 'default'}),
    NbLayoutModule,
    NbActionsModule,
    NbMenuModule.forRoot(),
    NbContextMenuModule,
    NbToastrModule.forRoot({duration: 5000}),
    NbEvaIconsModule,
    SocketIoModule.forRoot({
      url: environment.socketUrl,
      options: {},
    }),
    NbSelectWithAutocompleteModule,
    ReactiveFormsModule,
    NbIconModule,
    NbFormFieldModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private webSocketService: WebsocketService) {}
}
