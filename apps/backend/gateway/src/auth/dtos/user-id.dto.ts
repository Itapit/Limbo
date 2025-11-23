import { IsMongoId } from 'class-validator';

export class UserIdParamsDto {
  @IsMongoId({ message: 'Invalid User ID format' })
  userId: string;
}
