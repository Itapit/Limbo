import { Role } from '../base';
import { UserBase } from '../base/user-base.interface';

export interface RegisterRequest extends UserBase {
  password: string;
  role?: Role;
}
