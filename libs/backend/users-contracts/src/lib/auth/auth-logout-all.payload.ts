import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AuthLogoutAllPayload {
  @IsMongoId()
  @IsNotEmpty()
  userId!: string;
}
