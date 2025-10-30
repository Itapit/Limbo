import { CompleteSetupRequest } from '@limbo/common';
import { IsString, MinLength } from 'class-validator';

export class CompleteSetupDto implements CompleteSetupRequest {
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}
