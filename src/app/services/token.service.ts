import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  filter,
  finalize,
  map,
  Observable,
  switchMap,
  take,
  tap,
  throwError,
  timer,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly authTokenKey: string = 'authToken';
  private readonly refreshTokenKey: string = 'refreshToken';

  private refreshingToken = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  private isServerAvailableSubject = new BehaviorSubject<boolean>(false);
  isServerAvailable$ = this.isServerAvailableSubject.asObservable();

  private userRoleSubject = new BehaviorSubject<string | null>(null);
  userRole$ = this.userRoleSubject.asObservable();

  private authHeaders: HttpHeaders | null = null;

  constructor(private http: HttpClient) {}

  public getTokenFromStorage(key: string): string | null {
    return localStorage.getItem(key);
  }

  public ensureTokenValidity(
    authToken: string | null,
    refreshToken: string | null
  ): Observable<string> {
    if (authToken && !this.isTokenExpired(authToken, 5 * 60 * 1000)) {
      this.extractUserRole(authToken);
      return new BehaviorSubject(authToken).asObservable();
    }

    if (refreshToken) {
      return this.refreshToken(refreshToken).pipe(
        map((tokens) => tokens.accessToken)
      );
    }

    this.clearTokens();
    return throwError(() => new Error('No valid token available'));
  }

  isTokenExpired(token: string, bufferTime: number = 5 * 60 * 1000): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      return Date.now() >= exp - bufferTime;
    } catch (error) {
      console.error('Invalid token format', error);
      return true;
    }
  }

  refreshToken(
    refreshToken: string,
    attempts: number = 0
  ): Observable<{ accessToken: string; refreshToken: string }> {
    if (this.refreshingToken) {
      return this.refreshTokenSubject.pipe(
        filter((token): token is string => token !== null),
        take(1),
        map((newAccessToken: string) => ({
          accessToken: newAccessToken,
          refreshToken,
        }))
      );
    }

    this.refreshingToken = true;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post<{ accessToken: string; refreshToken: string }>(
        'https://localhost:7057/api/auth/refresh-token',
        JSON.stringify({ refreshToken }),
        { headers }
      )
      .pipe(
        tap((response) => {
          localStorage.setItem('authToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          this.refreshTokenSubject.next(response.accessToken);
          this.extractUserRole(response.accessToken);
        }),
        catchError((error) =>
          this.handleRefreshTokenError(error, refreshToken, attempts)
        ),
        finalize(() => {
          this.refreshingToken = false;
        })
      );
  }

  private handleRefreshTokenError(
    error: any,
    refreshToken: string,
    attempts: number
  ): Observable<{ accessToken: string; refreshToken: string }> {
    console.error('Failed to refresh token:', error);
    if (error.status === 0) {
      console.warn('Server unavailable...');
      this.isServerAvailableSubject.next(false);

      if (attempts < 3) {
        console.warn(`Retrying token refresh (attempt ${attempts + 1})`);
        this.refreshingToken = false;
        return timer(5000).pipe(
          switchMap(() => this.refreshToken(refreshToken, attempts + 1))
        );
      }

      console.error('Failed to refresh token after multiple attempts.');
      return throwError(() => new Error('Temporary server unavailability.'));
    }

    if (error.status === 400 || error.status === 401) {
      this.clearTokens();
    }

    if (error.status === 409) {
      console.warn('Another refresh token request is already in progress.');
    }

    this.refreshTokenSubject.next(null);
    return throwError(() => new Error('Failed to refresh token'));
  }

  private extractUserRole(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role =
        payload[
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        ] || null;
      this.userRoleSubject.next(role);
    } catch (error) {
      console.error('Failed to extract user role', error);
      this.userRoleSubject.next(null);
    }
  }

  public createAuthHeaders(token: string): HttpHeaders {
    if (
      !this.authHeaders ||
      this.authHeaders.get('Authorization') !== `Bearer ${token}`
    ) {
      this.authHeaders = new HttpHeaders({ Authorization: `Bearer ${token}` });
    }
    return this.authHeaders;
  }

  clearTokens(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }
}
