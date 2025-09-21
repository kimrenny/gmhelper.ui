import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, switchMap, take, throwError } from 'rxjs';
import { TokenService } from './token.service';
import { ApiResponse } from '../models/api-response.model';
import { environment } from 'src/environments/environment';
import {
  AuthLog,
  BlockStats,
  CombinedRequestsData,
  CountryStats,
  TokenStats,
  ErrorLog,
  RegistrationData,
  RequestLog,
  RoleStats,
  Token,
  User,
} from '../models/admin.model';
import { Store } from '@ngrx/store';
import * as AdminState from '../store/admin/admin.state';
import * as AdminActions from '../store/admin/admin.actions';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private store: Store<AdminState.AdminState>
  ) {}

  getUsers(): Observable<User[]> {
    return this.tokenService.getToken$().pipe(
      take(1),
      switchMap((token) => {
        if (!token || !this.checkAdminPermissions(token)) {
          return throwError(() => new Error('No permissions'));
        }

        return this.http
          .get<ApiResponse<User[]>>(`${this.apiUrl}/users`, {
            headers: this.tokenService.createAuthHeaders(token),
          })
          .pipe(map((res) => res.data));
      })
    );
  }

  getTokens(): Observable<Token[]> {
    return this.tokenService.getToken$().pipe(
      take(1),
      switchMap((token) => {
        if (!token || !this.checkAdminPermissions(token)) {
          return throwError(() => new Error('No permissions'));
        }

        return this.http
          .get<ApiResponse<Token[]>>(`${this.apiUrl}/tokens`, {
            headers: this.tokenService.createAuthHeaders(token),
          })
          .pipe(map((res) => res.data));
      })
    );
  }

  getRegistrationData(): Observable<RegistrationData[]> {
    return this.tokenService.getToken$().pipe(
      take(1),
      switchMap((token) => {
        if (!token || !this.checkAdminPermissions(token)) {
          return throwError(() => new Error('No permissions'));
        }
        return this.http
          .get<ApiResponse<RegistrationData[]>>(
            `${this.apiUrl}/dashboard/registrations`,
            {
              headers: this.tokenService.createAuthHeaders(token),
            }
          )
          .pipe(map((res) => res.data));
      })
    );
  }

  getTokenStats(): Observable<TokenStats> {
    return this.tokenService.getToken$().pipe(
      take(1),
      switchMap((token) => {
        if (!token || !this.checkAdminPermissions(token)) {
          return throwError(() => new Error('No permissions'));
        }
        return this.http
          .get<ApiResponse<TokenStats>>(`${this.apiUrl}/dashboard/tokens`, {
            headers: this.tokenService.createAuthHeaders(token),
          })
          .pipe(map((res) => res.data));
      })
    );
  }

  getRequestsData(): Observable<CombinedRequestsData> {
    return this.tokenService.getToken$().pipe(
      take(1),
      switchMap((token) => {
        if (!token || !this.checkAdminPermissions(token)) {
          return throwError(() => new Error('No permissions'));
        }
        return this.http
          .get<ApiResponse<CombinedRequestsData>>(`${this.apiUrl}/logs/stats`, {
            headers: this.tokenService.createAuthHeaders(token),
          })
          .pipe(map((res) => res.data));
      })
    );
  }

  getUsersByCountry(): Observable<CountryStats[]> {
    return this.tokenService.getToken$().pipe(
      take(1),
      switchMap((token) => {
        if (!token || !this.checkAdminPermissions(token)) {
          return throwError(() => new Error('No permissions'));
        }
        return this.http
          .get<ApiResponse<CountryStats[]>>(`${this.apiUrl}/stats/country`, {
            headers: this.tokenService.createAuthHeaders(token),
          })
          .pipe(map((res) => res.data));
      })
    );
  }

  getRoleStats(): Observable<RoleStats[]> {
    return this.tokenService.getToken$().pipe(
      take(1),
      switchMap((token) => {
        if (!token || !this.checkAdminPermissions(token)) {
          return throwError(() => new Error('No permissions'));
        }
        return this.http
          .get<ApiResponse<RoleStats[]>>(`${this.apiUrl}/stats/roles`, {
            headers: this.tokenService.createAuthHeaders(token),
          })
          .pipe(map((res) => res.data));
      })
    );
  }

  getBlockStats(): Observable<BlockStats[]> {
    return this.tokenService.getToken$().pipe(
      take(1),
      switchMap((token) => {
        if (!token || !this.checkAdminPermissions(token)) {
          return throwError(() => new Error('No permissions'));
        }
        return this.http
          .get<ApiResponse<BlockStats[]>>(`${this.apiUrl}/stats/blocked`, {
            headers: this.tokenService.createAuthHeaders(token),
          })
          .pipe(map((res) => res.data));
      })
    );
  }

  getRequestLogData(): Observable<RequestLog[]> {
    return this.tokenService.getToken$().pipe(
      take(1),
      switchMap((token) => {
        if (!token || !this.checkAdminPermissions(token)) {
          return throwError(() => new Error('No permissions'));
        }
        return this.http
          .get<ApiResponse<RequestLog[]>>(`${this.apiUrl}/logs`, {
            headers: this.tokenService.createAuthHeaders(token),
          })
          .pipe(map((res) => res.data));
      })
    );
  }

  getAuthLogData(): Observable<AuthLog[]> {
    return this.tokenService.getToken$().pipe(
      take(1),
      switchMap((token) => {
        if (!token || !this.checkAdminPermissions(token)) {
          return throwError(() => new Error('No permissions'));
        }
        return this.http
          .get<ApiResponse<AuthLog[]>>(`${this.apiUrl}/logs/auth`, {
            headers: this.tokenService.createAuthHeaders(token),
          })
          .pipe(map((res) => res.data));
      })
    );
  }

  getErrorLogData(): Observable<ErrorLog[]> {
    return this.tokenService.getToken$().pipe(
      take(1),
      switchMap((token) => {
        if (!token || !this.checkAdminPermissions(token)) {
          return throwError(() => new Error('No permissions'));
        }
        return this.http
          .get<ApiResponse<ErrorLog[]>>(`${this.apiUrl}/logs/errors`, {
            headers: this.tokenService.createAuthHeaders(token),
          })
          .pipe(map((res) => res.data));
      })
    );
  }

  actionUser(userId: string, action: 'ban' | 'unban'): Observable<any> {
    return this.tokenService.getToken$().pipe(
      take(1),
      switchMap((token) => {
        if (!token) return throwError(() => new Error('Token does not exist'));
        return this.http.put(
          `${this.apiUrl}/users/${userId}/action`,
          { action },
          {
            headers: this.tokenService.createAuthHeaders(token),
          }
        );
      })
    );
  }

  actionToken(
    tokenStr: string,
    action: 'activate' | 'disable'
  ): Observable<any> {
    return this.tokenService.getToken$().pipe(
      take(1),
      switchMap((token) => {
        if (!token) return throwError(() => new Error('Token does not exist'));
        return this.http.put(
          `${this.apiUrl}/tokens/${tokenStr}/action`,
          { action },
          {
            headers: this.tokenService.createAuthHeaders(token),
          }
        );
      })
    );
  }

  checkAdminPermissions(token: string | null): boolean {
    if (!token) return false;
    const role = this.tokenService.extractUserRole(token);
    return role == 'Admin' || role == 'Owner';
  }
}
