import { USER_PATTERNS } from '@limbo/users-contracts';
import { Controller, Get } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @MessagePattern(USER_PATTERNS.PING)
  handlePing(data: string): string {
    console.log(`Received PING from Gateway: ${data}`);
    return 'PONG from Users Service!';
  }
}
