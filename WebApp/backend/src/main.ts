import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /*** global middleware ***/
  // GZIP Support
  app.use(compression());
  // HTTP Header
  app.use(helmet());
  // Allow CORS
  app.enableCors();

  const port = app.get(ConfigService).get('PORT') || 3000;

  // setup request size
  app.use(json({ limit: '5m' }));
  app.use(urlencoded({ extended: true, limit: '5mb' }));
  await app.listen(port);
}
bootstrap();
