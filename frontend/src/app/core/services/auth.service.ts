import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, finalize, map, shareReplay, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private baseUrl = environment.apiUrl;
  private accessToken: string | null = null;
  private userPayload: any = null;
  private refreshRequest$: Observable<string> | null = null;

  constructor() {
    // Attempt to load access token from sessionStorage as fallback (for page refreshes, as allowed by PRD/TRD)
    const savedToken = sessionStorage.getItem('accessToken');
    if (savedToken) {
      this.accessToken = savedToken;
      this.userPayload = this.decodeToken(savedToken);
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/login`, { email, password }, { withCredentials: true }).pipe(
      map(res => {
        if (!res?.accessToken || typeof res.accessToken !== 'string') {
          throw new Error('Authentication response did not include a valid access token');
        }
        this.setToken(res.accessToken);
        return res;
      })
    );
  }

  refreshAccessToken(): Observable<string> {
    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    this.refreshRequest$ = this.http.post<any>(`${this.baseUrl}/auth/refresh`, {}, { withCredentials: true }).pipe(
      map(res => {
        if (!res?.accessToken || typeof res.accessToken !== 'string') {
          throw new Error('Refresh response did not include a valid access token');
        }
        this.setToken(res.accessToken);
        return res.accessToken;
      }),
      catchError(err => {
        this.clearToken();
        return throwError(() => err);
      }),
      finalize(() => this.refreshRequest$ = null),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    return this.refreshRequest$;
  }

  logout(): void {
    this.http.post(`${this.baseUrl}/auth/logout`, {}, { withCredentials: true }).subscribe({
      next: () => this.clearTokenAndNavigate(),
      error: () => this.clearTokenAndNavigate()
    });
  }

  isLoggedIn(): boolean {
    if (!this.accessToken || !this.userPayload || this.isTokenExpired(this.userPayload)) {
      this.clearToken();
      return false;
    }
    return true;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getUserRole(): string | null {
    return this.userPayload ? this.userPayload.role : null;
  }

  getUserId(): string | null {
    return this.userPayload ? this.userPayload.userId : null;
  }

  getClientId(): string | null {
    return this.userPayload ? this.userPayload.clientId : null;
  }

  getStoreIds(): string[] {
    return this.userPayload && this.userPayload.storeIds ? this.userPayload.storeIds : [];
  }

  getUserName(): string | null {
    return this.userPayload ? this.userPayload.name : 'User';
  }

  private setToken(token: string): void {
    this.accessToken = token;
    this.userPayload = this.decodeToken(token);
    sessionStorage.setItem('accessToken', token); // For persistence during app refresh
  }

  private clearToken(): void {
    this.accessToken = null;
    this.userPayload = null;
    sessionStorage.removeItem('accessToken');
  }

  private clearTokenAndNavigate(): void {
    this.clearToken();
    this.router.navigate(['/login']);
  }

  private decodeToken(token: string): any {
    try {
      const payloadPart = token.split('.')[1];
      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  private isTokenExpired(payload: any): boolean {
    return typeof payload?.exp !== 'number' || payload.exp * 1000 <= Date.now();
  }
}
