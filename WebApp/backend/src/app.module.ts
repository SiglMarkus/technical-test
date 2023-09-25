import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { WebsocketGateway } from './global/websocket.gateway';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      ignoreEnvFile: process.env.DOCKER_MODE == 'true', // if dockerMode we get variables from process.env!
      envFilePath: !process.env.NODE_ENV
        ? '.env'
        : `.env_${process.env.NODE_ENV}`,
    }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, WebsocketGateway],
})
export class AppModule {
  // TODO maybe loggin middleware here?
}
