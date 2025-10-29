import { USER_PATTERNS } from '@limbo/users-contracts';
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(USER_PATTERNS.PING)
  handlePing(data: string): string {
    console.log(`Received PING from Gateway: ${data}`);
    return 'PONG from Users Service!';
  }
}
