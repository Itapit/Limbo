import { createSelector } from '@ngrx/store';
import { AuthStatus } from '../dtos/auth-status.enum';
import { authFeature } from './auth.reducer';

export const {
  selectAuthState,
  selectLoading: selectAuthLoading,
  selectError: selectAuthError,
  selectUser,
  selectStatus: selectAuthStatus,
} = authFeature;

/**
 * Selects if the user is currently authenticated (has a user object and is ACTIVE).
 */
export const selectIsLoggedIn = createSelector(
  selectUser,
  selectAuthStatus,
  (user, status) => user !== null && status === AuthStatus.ACTIVE
);

/**
 * Selects if the user is definitively logged out.
 */
export const selectIsLoggedOut = createSelector(selectAuthStatus, (status) => status === AuthStatus.LOGGED_OUT);

/**
 * Selects if we are currently in the PENDING state.
 */
export const selectIsPending = createSelector(selectAuthStatus, (status) => status === AuthStatus.PENDING);

/**
 * Selects if we are still booting up (haven't checked token yet).
 */
export const selectIsUnknown = createSelector(selectAuthStatus, (status) => status === AuthStatus.UNKNOWN);

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
