import { USER_PATTERNS, USER_SERVICE } from '@limbo/users-contracts';
import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(USER_SERVICE) private readonly client: ClientProxy // Inject the client
  ) {}

  @Get('check-comms')
  async checkComms(): Promise<string> {
    const payload = 'Hello from Gateway!';

    // The send method returns an Observable. Use firstValueFrom to await the result.
    const result = await firstValueFrom(this.client.send(USER_PATTERNS.PING, payload));

    return `Microservice communication successful! Users Service replied: **${result}**`;
  }
}
