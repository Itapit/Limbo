/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { USER_CONFIG } from '@limbo/messaging-config';

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      port: USER_CONFIG.PORT,
    },
  });
  await app.listen();
}

bootstrap();
