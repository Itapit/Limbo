import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { SessionStatus } from '../../dtos/session-status.enum';
import { AuthFacade } from '../../store/auth.facade';

export const LoggedInGuard: CanActivateFn = () => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  return authFacade.status$.pipe(
    filter((status) => status != SessionStatus.UNKNOWN),
    take(1),
    map((isLoggedIn) => {
      if (isLoggedIn) {
        return true;
      }
      return router.createUrlTree(['/auth/login']);
    })
  );
};
