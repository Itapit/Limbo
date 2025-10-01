import { authFeature } from './auth.reducer';

export const {
  selectAuthState,
  selectLoading: selectAuthLoading,
  selectError: selectAuthError,
  selectUsername,
  selectEmail,
  selectRole,
} = authFeature;
