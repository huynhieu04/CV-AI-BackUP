import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export type Role = 'HR' | 'ADMIN';

export interface CurrentUser {
  id?: string;
  username?: string;
  name?: string;
  email?: string;
  role?: Role;
}

interface LoginResponse {
  ok: boolean;
  token: string;
  user: CurrentUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private TOKEN_KEY = 'cv_ai_token';
  private USER_KEY = 'cv_ai_user';

  // dùng env (dev/prod)
  private API = `${environment.apiBaseUrl}/auth`;

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<CurrentUser> {
    return this.http
      .post<LoginResponse>(`${this.API}/login`, { username, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(this.TOKEN_KEY, res.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
        }),
        map((res) => res.user)
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): CurrentUser | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CurrentUser;
    } catch {
      return null;
    }
  }
}
