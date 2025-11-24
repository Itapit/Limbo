import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppPaths } from './app-routes.enum';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private router = inject(Router);

  toDashboard(): void {
    this.router.navigate([AppPaths.dashboard]);
  }

  toLogin(): void {
    this.router.navigate([AppPaths.auth.login]);
  }

  toCompleteSetup(token?: string): void {
    const commands = [AppPaths.auth.completeSetup];
    const extras = token ? { queryParams: { token } } : {};
    this.router.navigate(commands, extras);
  }

  toRoot(): void {
    this.router.navigate(['/']);
  }
}
