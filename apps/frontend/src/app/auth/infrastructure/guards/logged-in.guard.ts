import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthFacade } from '../../store/auth.facade';

export const LoggedInGuard: CanActivateFn = () => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  return authFacade.isLoggedIn$.pipe(
    take(1),
    map((isLoggedIn) => {
      if (isLoggedIn) {
        return true;
      }
      return router.createUrlTree(['/auth/login']);
    })
  );
};
