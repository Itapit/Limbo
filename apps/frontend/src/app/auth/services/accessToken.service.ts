import { Injectable } from '@angular/core';
import { AccessTokenInfo } from '@limbo/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AccessTokenService {
  private accessToken$ = new BehaviorSubject<string | null>(null);
  private expiresAt: number | null = null;

  setToken(tokenInfo: AccessTokenInfo): void {
    this.accessToken$.next(tokenInfo.token);
    this.expiresAt = tokenInfo.expiresAt;
  }

  getToken(): string | null {
    return this.accessToken$.value;
  }

  getToken$() {
    return this.accessToken$.asObservable();
  }

  clear(): void {
    this.accessToken$.next(null);
    this.expiresAt = null;
  }

  isExpired(): boolean {
    return !!this.expiresAt && Date.now() >= this.expiresAt;
  }
}
