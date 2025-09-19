import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first, Observable, switchMap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Store } from '@ngrx/store';
import * as AuthSelectors from '../store/auth/auth.selectors';
import * as AuthState from '../store/auth/auth.state';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private api = `${environment.apiUrl}`;

  constructor(
    private http: HttpClient,
    private authStore: Store<AuthState.AuthState>
  ) {}

  getToken$(): Observable<string> {
    return this.authStore.select(AuthSelectors.selectAccessToken).pipe(
      first(),
      switchMap((token) => {
        if (!token) return throwError(() => new Error('Token does not exist'));
        return [token];
      })
    );
  }

  refreshToken(
    refreshToken: string
  ): Observable<{ accessToken: string; refreshToken: string }> {
    return this.http.post<{ accessToken: string; refreshToken: string }>(
      `${this.api}/auth/token/refresh`,
      { refreshToken }
    );
  }

  isTokenExpired(token: string, bufferTime: number = 5 * 60 * 1000): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      return Date.now() >= exp - bufferTime;
    } catch (error) {
      return true;
    }
  }

  extractUserRole(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return (
        payload[
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        ] || null
      );
    } catch {
      return null;
    }
  }

  public createAuthHeaders(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
