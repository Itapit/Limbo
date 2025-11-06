import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs';
import { AuthActions } from '../auth/store/auth.actions';

@Injectable()
export class AppInitEffects {
  private actions$ = inject(Actions);

  // =================================================================
  // APP INIT FLOW (F5 REFRESH)
  // =================================================================
  // This effect should be in your `app-init.effects.ts`
  // We'll put it here for now to show the flow.
  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.init),
      map(() => AuthActions.refreshStart())
    )
  );
}
