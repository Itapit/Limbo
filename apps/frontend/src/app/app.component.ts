import { Component, inject } from '@angular/core';
import { AuthFacade } from './auth/store/auth.facade';
import { CoreFacade } from './core/store/core.facade';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private coreFacade = inject(CoreFacade);
  private authFacade = inject(AuthFacade);

  globalError$ = this.coreFacade.globalError$;
  isAppLoading$ = this.authFacade.isAppLoading$;

  reloadApp(): void {
    window.location.reload();
  }
}
