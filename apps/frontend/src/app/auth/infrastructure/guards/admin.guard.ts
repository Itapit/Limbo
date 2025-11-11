import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { UserRole } from '@limbo/common';
import { combineLatest, map, take } from 'rxjs';
import { AuthFacade } from '../../store/auth.facade';

export const adminGuard: CanMatchFn = () => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  return combineLatest([authFacade.isLoggedIn$, authFacade.role$]).pipe(
    take(1),
    map(([isLoggedIn, role]) => {
      if (isLoggedIn && role === UserRole.ADMIN) {
        return true; // User is logged in AND is an admin
      }

      return router.createUrlTree(['/']);
    })
  );
};
