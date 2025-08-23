import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { TokenService } from './token.service';
import { Observable, of, throwError } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

interface TwoFactorResponse {
  qrCode: string;
  secret: string;
}

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  private api = `${environment.apiUrl}/api/security`;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  generate2FA(): Observable<ApiResponse<TwoFactorResponse>> {
    const token = this.tokenService.getTokenFromStorage('authToken');
    if (!token) return throwError(() => new Error('No auth token found'));

    return this.http.post<ApiResponse<TwoFactorResponse>>(
      `${this.api}/2fa/generate`,
      { type: 'totp' },
      { headers: this.tokenService.createAuthHeaders(token) }
    );
  }

  verify2FA(code: string): Observable<{ success: boolean }> {
    const token = this.tokenService.getTokenFromStorage('authToken');
    if (!token) return of({ success: false });

    return this.http.post<{ success: boolean }>(
      `${this.api}/2fa/verify`,
      { type: 'totp', code },
      { headers: this.tokenService.createAuthHeaders(token) }
    );
  }

  update2FAMode(mode: 'always' | 'ip_only', code: string): Observable<any> {
    const token = this.tokenService.getTokenFromStorage('authToken');
    if (!token) {
      return throwError(() => new Error('No token'));
    }

    return this.http.post<any>(
      `${this.api}/2fa/update-mode`,
      { mode, code },
      { headers: this.tokenService.createAuthHeaders(token) }
    );
  }

  disable2FA(code: string): Observable<any> {
    const token = this.tokenService.getTokenFromStorage('authToken');
    if (!token) {
      return throwError(() => new Error('No token'));
    }

    return this.http.post<any>(
      `${this.api}/2fa/disable`,
      { code },
      { headers: this.tokenService.createAuthHeaders(token) }
    );
  }
}
