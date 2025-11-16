import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { UserRole } from '@limbo/common';
import { filter, map, switchMap, take } from 'rxjs';
import { SessionStatus } from '../../dtos/session-status.enum';
import { AuthFacade } from '../../store/auth.facade';

export const adminGuard: CanMatchFn = () => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  return authFacade.status$.pipe(
    filter((status) => status !== SessionStatus.UNKNOWN),
    take(1),

    switchMap(() => authFacade.role$),
    take(1),
    map((role) => {
      if (role === UserRole.ADMIN) {
        return true;
      }

      return router.createUrlTree(['/']);
    })
  );
};
