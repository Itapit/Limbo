import { createFeature, createReducer, on } from '@ngrx/store';

import { AuthActions } from './auth.actions';
import { AUTH_FEATURE_KEY, initialAuthState } from './auth.state';

export const authReducer = createReducer(
  initialAuthState,

  // Start api call
  on(AuthActions.loginStart, AuthActions.registerStart, AuthActions.logoutStart, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  // Success
  on(AuthActions.loginSuccess, AuthActions.registerSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),

  // Failure
  on(AuthActions.loginFailure, AuthActions.registerFailure, AuthActions.logoutFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Logout success
  on(AuthActions.logoutSuccess, () => initialAuthState),

  // clear error
  on(AuthActions.clearError, (state) => ({
    ...state,
    error: null,
  }))
);

export const authFeature = createFeature({
  name: AUTH_FEATURE_KEY,
  reducer: authReducer,
});
