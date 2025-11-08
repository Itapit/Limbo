import { createSelector } from '@ngrx/store';
import { SessionStatus } from '../dtos/session-status.enum';
import { authFeature } from './auth.reducer';

export const {
  selectLoading: selectAuthLoading,
  selectError: selectAuthError,
  selectUser,
  selectSessionStatus: selectSessionStatus,
} = authFeature;

/**
 * Selects if the user is currently authenticated (has a user object and is ACTIVE).
 */
export const selectIsLoggedIn = createSelector(
  selectUser,
  selectSessionStatus,
  (user, status) => user !== null && status === SessionStatus.ACTIVE
);

/**
 * Selects if the user is definitively logged out.
 */
export const selectIsLoggedOut = createSelector(selectSessionStatus, (status) => status === SessionStatus.LOGGED_OUT);

/**
 * Selects if we are currently in the PENDING state.
 */
export const selectIsPending = createSelector(selectSessionStatus, (status) => status === SessionStatus.PENDING);

/**
 * Selects if we are still booting up (haven't checked token yet).
 */
export const selectIsUnknown = createSelector(selectSessionStatus, (status) => status === SessionStatus.UNKNOWN);

/**
 * Selects the user's role.
 */
export const selectRole = createSelector(selectUser, (user) => user?.role ?? null);

/**
 * Selects the user's username.
 */
export const selectUsername = createSelector(selectUser, (user) => user?.username ?? null);

/**
 * Selects the user's email.
 */
export const selectEmail = createSelector(selectUser, (user) => user?.email ?? null);
