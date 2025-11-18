import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AccessTokenService {
  private accessToken$ = new BehaviorSubject<string | null>(null);

  setToken(token: string): void {
    this.accessToken$.next(token);
  }

  getToken(): string | null {
    return this.accessToken$.value;
  }

  getToken$() {
    return this.accessToken$.asObservable();
  }

  clear(): void {
    this.accessToken$.next(null);
  }
}
