import { RouterReducerState, SerializedRouterStateSnapshot } from '@ngrx/router-store';
import { AuthState } from '../auth/store/auth.state';

export interface AppState {
  router: RouterReducerState<SerializedRouterStateSnapshot>;
  auth: AuthState;
}

export const initialAppState: Partial<AppState> = {};
