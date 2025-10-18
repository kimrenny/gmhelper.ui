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
  AdminData,
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

  getAdminData(): Observable<AdminData> {
    return this.tokenService.getToken$().pipe(
      take(1),
      switchMap((token) => {
        if (!token || !this.checkAdminPermissions(token)) {
          return throwError(() => new Error('No permissions'));
        }

        return this.http
          .get<ApiResponse<AdminData>>(`${this.apiUrl}`, {
            headers: this.tokenService.createAuthHeaders(token),
          })
          .pipe(map((response) => response.data));
      })
    );
  }

  getUsers(
    page: number,
    pageSize: number,
    sortBy: keyof User = 'registrationDate',
    descending: boolean = false,
    maxRegistrationDate?: string
  ): Observable<{ users: User[]; totalCount: number }> {
    return this.tokenService.getToken$().pipe(
      take(1),
      switchMap((token) => {
        if (!token || !this.checkAdminPermissions(token)) {
          return throwError(() => new Error('No permissions'));
        }

        const params: any = {
          page,
          pageSize,
          sortBy,
          descending,
        };

        if (maxRegistrationDate) {
          params.maxRegistrationDate = maxRegistrationDate;
        }

        return this.http
          .get<ApiResponse<{ items: User[]; totalCount: number }>>(
            `${this.apiUrl}/users`,
            {
              headers: this.tokenService.createAuthHeaders(token),
              params,
            }
          )
          .pipe(
            map((res) => ({
              users: res.data.items,
              totalCount: res.data.totalCount,
            }))
          );
      })
    );
  }

  getTokens(
    page: number,
    pageSize: number,
    sortBy: keyof Token = 'expiration',
    descending: boolean = false,
    maxExpirationDate?: string
  ): Observable<{ tokens: Token[]; totalCount: number }> {
    return this.tokenService.getToken$().pipe(
      take(1),
      switchMap((token) => {
        if (!token || !this.checkAdminPermissions(token)) {
          return throwError(() => new Error('No permissions'));
        }

        const params: any = {
          page,
          pageSize,
          sortBy,
          descending,
        };

        if (maxExpirationDate) {
          params.maxExpirationDate = maxExpirationDate;
        }

        return this.http
          .get<ApiResponse<{ items: Token[]; totalCount: number }>>(
            `${this.apiUrl}/tokens`,
            {
              headers: this.tokenService.createAuthHeaders(token),
              params,
            }
          )
          .pipe(
            map((res) => ({
              tokens: res.data.items,
              totalCount: res.data.totalCount,
            }))
          );
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

  getRequestLogData(
    page: number,
    pageSize: number,
    sortBy: keyof RequestLog = 'id',
    descending: boolean = false,
    maxLogDate?: string
  ): Observable<{ logs: RequestLog[]; totalCount: number }> {
    return this.tokenService.getToken$().pipe(
      take(1),
      switchMap((token) => {
        if (!token || !this.checkAdminPermissions(token)) {
          return throwError(() => new Error('No permissions'));
        }

        const params: any = {
          page,
          pageSize,
          sortBy,
          descending,
        };

        if (maxLogDate) {
          params.maxLogDate = maxLogDate;
        }

        return this.http
          .get<ApiResponse<{ items: RequestLog[]; totalCount: number }>>(
            `${this.apiUrl}/logs`,
            {
              headers: this.tokenService.createAuthHeaders(token),
              params,
            }
          )
          .pipe(
            map((res) => ({
              logs: res.data.items,
              totalCount: res.data.totalCount,
            }))
          );
      })
    );
  }

  getAuthLogData(
    page: number,
    pageSize: number,
    sortBy: keyof AuthLog = 'id',
    descending: boolean = false,
    maxLogDate?: string
  ): Observable<{ logs: AuthLog[]; totalCount: number }> {
    return this.tokenService.getToken$().pipe(
      take(1),
      switchMap((token) => {
        if (!token || !this.checkAdminPermissions(token)) {
          return throwError(() => new Error('No permissions'));
        }

        const params: any = {
          page,
          pageSize,
          sortBy,
          descending,
        };

        if (maxLogDate) {
          params.maxLogDate = maxLogDate;
        }

        return this.http
          .get<ApiResponse<{ items: AuthLog[]; totalCount: number }>>(
            `${this.apiUrl}/logs/auth`,
            {
              headers: this.tokenService.createAuthHeaders(token),
              params,
            }
          )
          .pipe(
            map((res) => ({
              logs: res.data.items,
              totalCount: res.data.totalCount,
            }))
          );
      })
    );
  }

  getErrorLogData(
    page: number,
    pageSize: number,
    sortBy: keyof ErrorLog = 'id',
    descending: boolean = false,
    maxLogDate?: string
  ): Observable<{ logs: ErrorLog[]; totalCount: number }> {
    return this.tokenService.getToken$().pipe(
      take(1),
      switchMap((token) => {
        if (!token || !this.checkAdminPermissions(token)) {
          return throwError(() => new Error('No permissions'));
        }

        const params: any = {
          page,
          pageSize,
          sortBy,
          descending,
        };

        if (maxLogDate) {
          params.maxLogDate = maxLogDate;
        }

        return this.http
          .get<ApiResponse<{ items: ErrorLog[]; totalCount: number }>>(
            `${this.apiUrl}/logs/errors`,
            {
              headers: this.tokenService.createAuthHeaders(token),
              params,
            }
          )
          .pipe(
            map((res) => ({
              logs: res.data.items,
              totalCount: res.data.totalCount,
            }))
          );
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
