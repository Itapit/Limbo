import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { routerReducer, StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { authFeature } from '../auth/store/auth.reducer';
import { AppInitEffects } from './app-init.effects';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    // router store
    StoreModule.forRoot({
      router: routerReducer,
    }),
    StoreRouterConnectingModule.forRoot({ stateKey: 'router' }),

    // init effects
    EffectsModule.forRoot([AppInitEffects]),

    // devtool
    StoreDevtoolsModule.instrument({
      maxAge: 25,
    }),

    // Auth store
    StoreModule.forFeature(authFeature),
  ],
})
export class AppStoreModule {}
