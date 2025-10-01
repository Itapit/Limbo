import { Injectable, inject } from '@angular/core';
import { Actions } from '@ngrx/effects';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);

  // init$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(AuthActions.loginStart),
  //     switchMap(() => of(AuthActions.loadAuthSuccess({ auth: [] }))),
  //     catchError((error) => {
  //       console.error('Error', error);
  //       return of(AuthActions.loadAuthFailure({ error }));
  //     })
  //   )
  // );
}
