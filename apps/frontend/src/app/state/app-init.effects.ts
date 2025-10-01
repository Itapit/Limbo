import { Injectable, inject } from '@angular/core';
import { Actions } from '@ngrx/effects';

@Injectable()
export class AppInitEffects {
  private actions$ = inject(Actions);
}
