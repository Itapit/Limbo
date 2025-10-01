import { Role } from '@limbo/common';

export const AUTH_FEATURE_KEY = 'auth';

export interface AuthState {
  username: string | null;
  email: string | null;
  role: Role | null;
  loading: boolean;
  error: string | null; // last known error (if any)
}

export const initialAuthState: AuthState = {
  // set initial required properties
  username: null,
  email: null,
  role: null,
  loading: false,
  error: null,
};
