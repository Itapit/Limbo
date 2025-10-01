import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { AuthActions } from './auth.actions';
import { selectAuthError, selectAuthLoading, selectEmail, selectRole, selectUsername } from './auth.selectors';
import { AuthState } from './auth.state';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly store = inject<Store<{ auth: AuthState }>>(Store);

  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);
  role$ = this.store.select(selectRole);
  username$ = this.store.select(selectUsername);
  email$ = this.store.select(selectEmail);

  logout() {
    this.store.dispatch(AuthActions.logoutStart());
  }
}
