import { LoginRequest, RegisterRequest } from '@limbo/common';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login Start': props<{ loginRequest: LoginRequest }>(),
    'Login Success': emptyProps(),
    'Login Failure': props<{ error: string }>(),

    'Register start': props<{ registerRequest: RegisterRequest }>(),
    'Register Success': emptyProps(),
    'Register Failure': props<{ error: string }>(),

    'Logout Start': emptyProps(),
    'Logout Success': emptyProps(),
    'Logout Failure': props<{ error: string }>(),

    'Clear Error': emptyProps(),
  },
});
