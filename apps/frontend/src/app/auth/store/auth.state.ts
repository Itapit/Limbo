import { UserDto } from '@limbo/common';
import { AuthStatus } from '../dtos/auth-status.enum';

export const AUTH_FEATURE_KEY = 'auth';

export interface AuthState {
  user: UserDto | null;
  status: AuthStatus;
  loading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  status: AuthStatus.UNKNOWN,
  loading: false,
  error: null,
};
