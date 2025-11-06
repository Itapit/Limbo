import { UserStatus } from '@limbo/common';

/**
 * This enum defines the authentication states that are
 * internal to the frontend UI and do not exist in the backend.
 */
export enum AuthStatus {
  LOGGED_OUT = 'loggedOut',
  UNKNOWN = 'unknown',
  PENDING = UserStatus.PENDING,
  ACTIVE = UserStatus.ACTIVE,
}
