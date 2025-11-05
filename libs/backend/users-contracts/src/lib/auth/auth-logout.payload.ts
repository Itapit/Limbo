import { IsNotEmpty, IsString } from 'class-validator';

export class AuthLogoutPayload {
  @IsString()
  @IsNotEmpty()
  jti!: string;
}
