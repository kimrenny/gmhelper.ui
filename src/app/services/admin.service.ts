import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  map,
  Observable,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { TokenService } from './token.service';
import { ApiResponse } from '../models/api-response.model';
import { environment } from 'src/environments/environment';
import {
  AuthLog,
  BlockStats,
  CombinedRequestsData,
  CountryStats,
  CreatedTokens,
  ErrorLog,
  RegistrationData,
  RequestLog,
  RoleStats,
  Token,
  User,
} from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl = `${environment.apiUrl}/api/admin`;
  private usersSubject = new BehaviorSubject<User[] | null>(null);
  users$ = this.usersSubject.asObservable();

  private tokensSubject = new BehaviorSubject<Token[] | null>(null);
  tokens$ = this.tokensSubject.asObservable();

  private registrationDataSubject = new BehaviorSubject<
    RegistrationData[] | null
  >(null);
  registrationData$ = this.registrationDataSubject.asObservable();

  private activeTokensSubject = new BehaviorSubject<number | null>(null);
  activeTokens$ = this.activeTokensSubject.asObservable();

  private totalTokensSubject = new BehaviorSubject<number | null>(null);
  totalTokens$ = this.totalTokensSubject.asObservable();

  private activeAdminTokensSubject = new BehaviorSubject<number | null>(null);
  activeAdminTokens$ = this.activeAdminTokensSubject.asObservable();

  private totalAdminTokensSubject = new BehaviorSubject<number | null>(null);
  totalAdminTokens$ = this.totalAdminTokensSubject.asObservable();

  private requestsDataSubject =
    new BehaviorSubject<CombinedRequestsData | null>(null);
  requestsData$ = this.requestsDataSubject.asObservable();

  private userCountryStatsSubject = new BehaviorSubject<CountryStats[] | null>(
    null
  );
  userCountryStats$ = this.userCountryStatsSubject.asObservable();

  private userRoleStatsSubject = new BehaviorSubject<RoleStats[] | null>(null);
  userRoleStats$ = this.userRoleStatsSubject.asObservable();

  private userBlockStatsSubject = new BehaviorSubject<BlockStats[] | null>(
    null
  );
  userBlockStats$ = this.userBlockStatsSubject.asObservable();

  private requestLogsDataSubject = new BehaviorSubject<RequestLog[] | null>(
    null
  );
  requestLogsData$ = this.requestLogsDataSubject.asObservable();

  private authLogsDataSubject = new BehaviorSubject<AuthLog[] | null>(null);
  authLogsData$ = this.authLogsDataSubject.asObservable();

  private errorLogsDataSubject = new BehaviorSubject<ErrorLog[] | null>(null);
  errorLogsData$ = this.errorLogsDataSubject.asObservable();

  private isDataLoaded = false;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  loadAdminData(): void {
    if (this.isDataLoaded) return;

    this.getAllUsers();
    this.getAllTokens();
    this.getRegistrationData();
    this.getCreatedTokens();
    this.getUsersByCountry();
    this.getRoleStats();
    this.getBlockStats();
    this.getRequestLogData();
    this.getAuthLogData();
    this.getErrorLogData();

    this.isDataLoaded = true;
  }

  getAllUsers(): void {
    const token = this.tokenService.getTokenFromStorage('authToken');

    if (!token) {
      return;
    }

    this.tokenService.userRole$
      .pipe(
        switchMap((role) => {
          if (role == 'Admin' || role == 'Owner') {
            return this.http
              .get<ApiResponse<User[]>>(`${this.apiUrl}/users`, {
                headers: this.tokenService.createAuthHeaders(token),
              })
              .pipe(map((response) => response.data));
          } else {
            return new Observable<User[] | null>((observer) => {
              observer.next(null);
              observer.complete();
            });
          }
        })
      )
      .subscribe((users) => {
        this.usersSubject.next(users);
      });
  }

  getUsers(): Observable<User[] | null> {
    return this.users$;
  }

  checkUsersData(): void {
    if (!this.usersSubject.value) {
      this.getAllUsers();
    }
  }

  actionUser(userId: string, action: 'ban' | 'unban'): Observable<any> {
    const token = this.tokenService.getTokenFromStorage('authToken');

    if (!token) {
      return throwError(() => new Error('Token does not exist'));
    }

    const body = {
      id: userId,
      action: action,
    };

    return this.http.put(`${this.apiUrl}/users/action`, body, {
      headers: this.tokenService.createAuthHeaders(token),
    });
  }

  getAllTokens(): void {
    const token = this.tokenService.getTokenFromStorage('authToken');

    if (!token) {
      return;
    }

    this.tokenService.userRole$
      .pipe(
        switchMap((role) => {
          if (role == 'Admin' || role == 'Owner') {
            return this.http
              .get<ApiResponse<Token[]>>(`${this.apiUrl}/tokens`, {
                headers: this.tokenService.createAuthHeaders(token),
              })
              .pipe(map((response) => response.data));
          } else {
            return new Observable<Token[] | null>((observer) => {
              observer.next(null);
              observer.complete();
            });
          }
        })
      )
      .subscribe((tokens) => {
        this.tokensSubject.next(tokens);
      });
  }

  getTokens(): Observable<Token[] | null> {
    return this.tokens$;
  }

  checkTokensData(): void {
    if (!this.tokensSubject.value) {
      this.getAllTokens();
    }
  }

  actionToken(token: string, action: 'activate' | 'disable'): Observable<any> {
    const authToken = this.tokenService.getTokenFromStorage('authToken');

    if (!authToken) {
      return throwError(() => new Error('Token does not exist'));
    }

    const body = {
      id: token,
      action: action,
    };

    return this.http.put(`${this.apiUrl}/tokens/action`, body, {
      headers: this.tokenService.createAuthHeaders(authToken),
    });
  }

  getRegistrationData(): void {
    const authToken = this.tokenService.getTokenFromStorage('authToken');

    if (!authToken) {
      return;
    }

    this.tokenService.userRole$
      .pipe(
        switchMap((role) => {
          if (this.checkAdminPermissions(role)) {
            return this.http
              .get<ApiResponse<RegistrationData[]>>(
                `${this.apiUrl}/dashboard/registrations`,
                { headers: this.tokenService.createAuthHeaders(authToken) }
              )
              .pipe(map((response) => response.data));
          } else {
            return new Observable<RegistrationData[] | null>((observer) => {
              observer.next(null);
              observer.complete();
            });
          }
        })
      )
      .subscribe((data) => {
        this.registrationDataSubject.next(data);
      });
  }

  checkRegistrationsData(): void {
    if (!this.registrationDataSubject.value) {
      this.getRegistrationData();
    }
  }

  getRegistrationDataObservable(): Observable<RegistrationData[] | null> {
    return this.registrationData$;
  }

  getCreatedTokens(): void {
    const authToken = this.tokenService.getTokenFromStorage('authToken');

    if (!authToken) {
      return;
    }

    this.tokenService.userRole$
      .pipe(
        switchMap((role) => {
          if (this.checkAdminPermissions(role)) {
            return this.http
              .get<ApiResponse<CreatedTokens>>(
                `${this.apiUrl}/dashboard/tokens`,
                {
                  headers: this.tokenService.createAuthHeaders(authToken),
                }
              )
              .pipe(map((response) => response.data));
          } else {
            return new Observable<CreatedTokens | null>((observer) => {
              observer.next(null);
              observer.complete();
            });
          }
        })
      )
      .subscribe((data) => {
        this.activeTokensSubject.next(data?.activeTokens ?? 0);
        this.totalTokensSubject.next(data?.totalTokens ?? 0);
        this.activeAdminTokensSubject.next(data?.activeAdminTokens ?? 0);
        this.totalAdminTokensSubject.next(data?.totalAdminTokens ?? 0);
      });
  }

  checkCreatedTokens(): void {
    if (!this.activeTokensSubject.value) {
      this.getCreatedTokens();
    }
  }

  getActiveTokensObservable(): Observable<number | null> {
    return this.activeTokens$;
  }

  getTotalTokensObservable(): Observable<number | null> {
    return this.totalTokens$;
  }

  getActiveAdminTokensObservable(): Observable<number | null> {
    return this.activeTokens$;
  }

  getTotalAdminTokensObservable(): Observable<number | null> {
    return this.totalTokens$;
  }

  getRequestsData(): void {
    const authToken = this.tokenService.getTokenFromStorage('authToken');

    if (!authToken) {
      return;
    }

    this.tokenService.userRole$
      .pipe(
        switchMap((role) => {
          if (this.checkAdminPermissions(role)) {
            return this.http
              .get<ApiResponse<CombinedRequestsData>>(
                `${this.apiUrl}/logs/requests`,
                { headers: this.tokenService.createAuthHeaders(authToken) }
              )
              .pipe(map((response) => response.data));
          } else {
            return new Observable<CombinedRequestsData | null>((observer) => {
              observer.next(null);
              observer.complete();
            });
          }
        })
      )
      .subscribe((data) => {
        this.requestsDataSubject.next(data);
      });
  }

  checkRequestsData(): void {
    if (!this.requestsDataSubject.value) {
      this.getRequestsData();
    }
  }

  getRequestsDataObservable(): Observable<CombinedRequestsData | null> {
    return this.requestsData$;
  }

  getUsersByCountry(): void {
    const authToken = this.tokenService.getTokenFromStorage('authToken');

    if (!authToken) {
      return;
    }

    this.tokenService.userRole$
      .pipe(
        switchMap((role) => {
          if (this.checkAdminPermissions(role)) {
            return this.http
              .get<ApiResponse<CountryStats[]>>(
                `${this.apiUrl}/country-rating`,
                { headers: this.tokenService.createAuthHeaders(authToken) }
              )
              .pipe(map((response) => response.data));
          } else {
            return new Observable<CountryStats[] | null>((observer) => {
              observer.next(null);
              observer.complete();
            });
          }
        })
      )
      .subscribe((data) => {
        this.userCountryStatsSubject.next(data);
      });
  }

  checkCountriesData(): void {
    if (!this.userCountryStatsSubject.value) {
      this.getUsersByCountry();
    }
  }

  getCountryUsersDataObservable(): Observable<CountryStats[] | null> {
    return this.userCountryStats$;
  }

  getRoleStats(): void {
    const authToken = this.tokenService.getTokenFromStorage('authToken');

    if (!authToken) {
      return;
    }

    this.tokenService.userRole$
      .pipe(
        switchMap((role) => {
          if (this.checkAdminPermissions(role)) {
            return this.http
              .get<ApiResponse<RoleStats[]>>(`${this.apiUrl}/role-stats`, {
                headers: this.tokenService.createAuthHeaders(authToken),
              })
              .pipe(map((response) => response.data));
          } else {
            return new Observable<RoleStats[] | null>((observer) => {
              observer.next(null);
              observer.complete();
            });
          }
        })
      )
      .subscribe((data) => {
        this.userRoleStatsSubject.next(data);
      });
  }

  checkRoleData(): void {
    if (!this.userRoleStatsSubject.value) {
      this.getRoleStats();
    }
  }

  getRoleStatsDataObservable(): Observable<RoleStats[] | null> {
    return this.userRoleStats$;
  }

  getBlockStats(): void {
    const authToken = this.tokenService.getTokenFromStorage('authToken');

    if (!authToken) {
      return;
    }

    this.tokenService.userRole$
      .pipe(
        switchMap((role) => {
          if (this.checkAdminPermissions(role)) {
            return this.http
              .get<ApiResponse<BlockStats[]>>(`${this.apiUrl}/block-stats`, {
                headers: this.tokenService.createAuthHeaders(authToken),
              })
              .pipe(map((response) => response.data));
          } else {
            return new Observable<BlockStats[] | null>((observer) => {
              observer.next(null);
              observer.complete();
            });
          }
        })
      )
      .subscribe((data) => {
        this.userBlockStatsSubject.next(data);
      });
  }

  checkBlockData(): void {
    if (!this.userBlockStatsSubject.value) {
      this.getBlockStats();
    }
  }

  getBlockStatsDataObservable(): Observable<BlockStats[] | null> {
    return this.userBlockStats$;
  }

  getRequestLogData(): void {
    const authToken = this.tokenService.getTokenFromStorage('authToken');

    if (!authToken) {
      return;
    }

    this.tokenService.userRole$
      .pipe(
        switchMap((role) => {
          if (this.checkAdminPermissions(role)) {
            return this.http
              .get<ApiResponse<RequestLog[]>>(`${this.apiUrl}/logs/all`, {
                headers: this.tokenService.createAuthHeaders(authToken),
              })
              .pipe(map((response) => response.data));
          } else {
            return new Observable<RequestLog[] | null>((observer) => {
              observer.next(null);
              observer.complete();
            });
          }
        })
      )
      .subscribe((data) => {
        this.requestLogsDataSubject.next(data);
      });
  }

  checkRequestLogData(): void {
    if (!this.requestLogsDataSubject.value) {
      this.getRequestsData();
    }
  }

  getRequestLogsDataObservable(): Observable<RequestLog[] | null> {
    return this.requestLogsData$;
  }

  getAuthLogData(): void {
    const authToken = this.tokenService.getTokenFromStorage('authToken');

    if (!authToken) {
      return;
    }

    this.tokenService.userRole$
      .pipe(
        switchMap((role) => {
          if (this.checkAdminPermissions(role)) {
            return this.http
              .get<ApiResponse<AuthLog[]>>(`${this.apiUrl}/logs/auth/all`, {
                headers: this.tokenService.createAuthHeaders(authToken),
              })
              .pipe(map((response) => response.data));
          } else {
            return new Observable<AuthLog[] | null>((observer) => {
              observer.next(null);
              observer.complete();
            });
          }
        })
      )
      .subscribe((data) => {
        this.authLogsDataSubject.next(data);
      });
  }

  checkAuthLogData(): void {
    if (!this.authLogsDataSubject.value) {
      this.getAuthLogData();
    }
  }

  getAuthLogDataObservable(): Observable<AuthLog[] | null> {
    return this.authLogsData$;
  }

  getErrorLogData(): void {
    const authToken = this.tokenService.getTokenFromStorage('authToken');

    if (!authToken) {
      return;
    }

    this.tokenService.userRole$
      .pipe(
        switchMap((role) => {
          if (this.checkAdminPermissions(role)) {
            return this.http
              .get<ApiResponse<ErrorLog[]>>(`${this.apiUrl}/logs/errors/all`, {
                headers: this.tokenService.createAuthHeaders(authToken),
              })
              .pipe(map((response) => response.data));
          } else {
            return new Observable<ErrorLog[] | null>((observer) => {
              observer.next(null);
              observer.complete();
            });
          }
        })
      )
      .subscribe((data) => {
        this.errorLogsDataSubject.next(data);
      });
  }

  checkErrorLogData(): void {
    if (!this.errorLogsDataSubject.value) {
      this.getErrorLogData();
    }
  }

  getErrorLogDataObservable(): Observable<ErrorLog[] | null> {
    return this.errorLogsData$;
  }

  checkAdminPermissions(role: string | null): boolean {
    return role == 'Admin' || role == 'Owner';
  }
}
