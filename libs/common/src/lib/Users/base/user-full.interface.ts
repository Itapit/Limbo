import { Role } from './role.enum';
import { UserBase } from './user-base.interface';

export interface UserFull extends UserBase {
  role: Role;
}
