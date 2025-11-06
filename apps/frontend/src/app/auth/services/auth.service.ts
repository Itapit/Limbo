import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  AuthRefreshResponse,
  CompleteSetupRequest,
  LoginRequest,
  LoginResponse,
  PendingLoginResponse,
  UserDto,
} from '@limbo/common';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = `${environment.BACKEND_BASE_URL}`;

  private http = inject(HttpClient);

  login(dto: LoginRequest): Observable<LoginResponse | PendingLoginResponse> {
    return this.http.post<LoginResponse | PendingLoginResponse>(`${this.baseUrl}/auth/login`, dto);
  }

  completeSetup(dto: CompleteSetupRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/complete-setup`, dto);
  }

  //TODO: add this in the back
  getMe(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.baseUrl}/users/me`);
  }

  refresh(): Observable<AuthRefreshResponse> {
    return this.http.post<AuthRefreshResponse>(`${this.baseUrl}/auth/refresh`, {}, { withCredentials: true });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/logout`, {}, { withCredentials: true });
  }
}
