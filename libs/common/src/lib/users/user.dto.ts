import { UserRole } from './user-role.enum';
import { UserStatus } from './user-status.enum';

export interface UserDto {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  status: UserStatus;
}
