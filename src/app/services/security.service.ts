import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { TokenService } from './token.service';
import { Observable, switchMap } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

interface TwoFactorResponse {
  qrCode: string;
  secret: string;
}

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  private api = `${environment.apiUrl}/security`;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  generate2FA(): Observable<ApiResponse<TwoFactorResponse>> {
    return this.tokenService
      .getToken$()
      .pipe(
        switchMap((token) =>
          this.http.post<ApiResponse<TwoFactorResponse>>(
            `${this.api}/2fa`,
            { type: 'totp' },
            { headers: this.tokenService.createAuthHeaders(token) }
          )
        )
      );
  }

  verify2FA(code: string): Observable<{ success: boolean }> {
    return this.tokenService
      .getToken$()
      .pipe(
        switchMap((token) =>
          this.http.post<{ success: boolean }>(
            `${this.api}/2fa/verify`,
            { type: 'totp', code },
            { headers: this.tokenService.createAuthHeaders(token) }
          )
        )
      );
  }

  update2FAMode(mode: 'always' | 'ip_only', code: string): Observable<any> {
    const alwaysAsk = mode === 'always';
    return this.tokenService
      .getToken$()
      .pipe(
        switchMap((token) =>
          this.http.patch<any>(
            `${this.api}/2fa`,
            { type: 'totp', alwaysAsk, code },
            { headers: this.tokenService.createAuthHeaders(token) }
          )
        )
      );
  }

  disable2FA(code: string): Observable<any> {
    return this.tokenService.getToken$().pipe(
      switchMap((token) =>
        this.http.delete<any>(`${this.api}/2fa`, {
          headers: this.tokenService.createAuthHeaders(token),
          body: { type: 'totp', code },
        })
      )
    );
  }
}
