import { Component, inject } from '@angular/core';
import { AuthFacade } from '../store/auth.facade';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  readonly authStore = inject(AuthFacade);

  loading$ = this.authStore.loading$;
  error$ = this.authStore.error$;
}
