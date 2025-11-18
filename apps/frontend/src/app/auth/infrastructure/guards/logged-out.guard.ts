import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthFacade } from '../../store/auth.facade';

export const loggedOutGuard: CanActivateFn = () => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  return authFacade.isLoggedIn$.pipe(
    take(1),
    map((isLoggedIn) => {
      if (isLoggedIn) {
        // User is logged in, redirect them *away* from this page
        return router.createUrlTree(['/']);
      }
      // User is not logged in, allow access to the login page
      return true;
    })
  );
};
