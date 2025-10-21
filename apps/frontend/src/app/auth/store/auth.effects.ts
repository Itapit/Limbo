import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';

import { Router } from '@angular/router';
import { AccessTokenInfo } from '@limbo/common';
import { Action, ActionCreator } from '@ngrx/store';
import { AccessTokenService } from '../services/accessToken.service';
import { AuthService } from '../services/auth.service';
import { AuthActions } from './auth.actions';

// Define a type for the action creators that take an error string
type AuthFailureActionCreator = ActionCreator<string, (props: { error: string }) => { error: string } & Action>;

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private tokenService = inject(AccessTokenService);
  private router = inject(Router);

  // Helper function to map HTTP errors to an Ngrx failure action.
  private handleApiError(error: HttpErrorResponse, action: AuthFailureActionCreator) {
    const errorMessage = error.error?.message || error.message || 'An unknown error occurred';
    return of(action({ error: errorMessage }));
  }

  // =================================================================
  // LOGIN FLOW
  // =================================================================

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginStart),
      switchMap(({ loginRequest }) =>
        this.authService.login(loginRequest).pipe(
          map((accessToken: AccessTokenInfo) => AuthActions.loginSuccess({ accessToken })),
          catchError((error: HttpErrorResponse) => this.handleApiError(error, AuthActions.loginFailure))
        )
      )
    )
  );

  // =================================================================
  // REGISTER FLOW
  // =================================================================

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerStart),
      switchMap(({ registerRequest }) =>
        this.authService.register(registerRequest).pipe(
          map((accessToken: AccessTokenInfo) => AuthActions.registerSuccess({ accessToken })),
          catchError((error: HttpErrorResponse) => this.handleApiError(error, AuthActions.registerFailure))
        )
      )
    )
  );

  // =================================================================
  // LOGIN/REGISTER SUCCESS - Handle token and trigger profile load
  // =================================================================

  loginRegisterSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess, AuthActions.registerSuccess),
      // Tap into the stream to save the token in the service
      tap(({ accessToken }) => this.tokenService.setToken(accessToken)),
      // Map the success action to trigger the load of the current user's profile
      map(() => AuthActions.loadMeStart())
    )
  );

  // =================================================================
  // REFRESH FLOW (Triggered on 401 interceptor or app bootstrap)
  // =================================================================

  refresh$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshStart),
      switchMap(() =>
        this.authService.refresh().pipe(
          map((accessToken: AccessTokenInfo) => AuthActions.refreshSuccess({ accessToken })),
          catchError((error: HttpErrorResponse) => this.handleApiError(error, AuthActions.refreshFailure))
        )
      )
    )
  );

  refreshSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshSuccess),
      // Save the new token
      tap(({ accessToken }) => this.tokenService.setToken(accessToken))
    )
  );

  refreshFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.refreshFailure),
        tap(() => {
          this.tokenService.clear();
          this.router.navigate(['auth/login']);
        })
      ),
    { dispatch: false }
  );

  // =================================================================
  // load profile FLOW
  // =================================================================

  //TODO load profile session

  // =================================================================
  // LOGOUT FLOW
  // =================================================================

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutStart),
      switchMap(() =>
        this.authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError((error: HttpErrorResponse) => {
            console.error('Logout API failed but forcing client logout:', error);
            return of(AuthActions.logoutSuccess());
          })
        )
      )
    )
  );

  logoutSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(AuthActions.logoutSuccess),
        tap(() => {
          this.tokenService.clear();
          this.router.navigate(['/login']);
        })
      );
    },
    { dispatch: false }
  );
}
