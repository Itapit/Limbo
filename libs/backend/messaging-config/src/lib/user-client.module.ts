import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { USER_CONFIG, USER_SERVICE } from './constants';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: USER_SERVICE,
        transport: Transport.TCP,
        options: {
          host: USER_CONFIG.HOST,
          port: USER_CONFIG.PORT,
        },
      },
    ]),
  ],
  exports: [ClientsModule, USER_SERVICE],
})
export class UserClientModule {}
