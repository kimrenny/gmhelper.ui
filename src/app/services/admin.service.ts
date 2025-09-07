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
  private readonly apiUrl = `${environment.apiUrl}/admin`;
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
    const token = this.tokenService.getTokenFromStorage('authToken');
    const role = this.tokenService.getUserRole();

    if (!token || !role || !this.checkAdminPermissions()) {
      console.warn(
        'No valid token or insufficient permissions to load admin data.'
      );
      return;
    }

    if (this.isDataLoaded) return;

    this.getAllUsers();
    this.getAllTokens();
    this.getRegistrationData();
    this.getCreatedTokens();
    this.getRequestsData();
    this.getUsersByCountry();
    this.getRoleStats();
    this.getBlockStats();
    this.getRequestLogData();
    this.getAuthLogData();
    this.getErrorLogData();

    this.isDataLoaded = true;
  }

  private getAllUsers(): void {
    const token = this.tokenService.getTokenFromStorage('authToken');

    if (!token || !this.checkAdminPermissions()) {
      this.usersSubject.next(null);
      return;
    }

    this.http
      .get<ApiResponse<User[]>>(`${this.apiUrl}/users`, {
        headers: this.tokenService.createAuthHeaders(token),
      })
      .pipe(map((response) => response.data))
      .subscribe((users) => {
        this.usersSubject.next(users);
      });
  }

  getUsers(): Observable<User[] | null> {
    if (!this.isDataLoaded && this.usersSubject.value === null) {
      this.getAllUsers();
    }
    return this.users$;
  }

  actionUser(userId: string, action: 'ban' | 'unban'): Observable<any> {
    const token = this.tokenService.getTokenFromStorage('authToken');

    if (!token) {
      return throwError(() => new Error('Token does not exist'));
    }

    const body = {
      action,
    };

    return this.http.put(`${this.apiUrl}/users/${userId}/action`, body, {
      headers: this.tokenService.createAuthHeaders(token),
    });
  }

  private getAllTokens(): void {
    const token = this.tokenService.getTokenFromStorage('authToken');

    if (!token || !this.checkAdminPermissions()) {
      this.tokensSubject.next(null);
      return;
    }

    this.http
      .get<ApiResponse<Token[]>>(`${this.apiUrl}/tokens`, {
        headers: this.tokenService.createAuthHeaders(token),
      })
      .pipe(map((response) => response.data))
      .subscribe((tokens) => {
        this.tokensSubject.next(tokens);
      });
  }

  getTokens(): Observable<Token[] | null> {
    if (!this.isDataLoaded && this.tokensSubject.value === null) {
      this.getAllTokens();
    }
    return this.tokens$;
  }

  actionToken(token: string, action: 'activate' | 'disable'): Observable<any> {
    const authToken = this.tokenService.getTokenFromStorage('authToken');

    if (!authToken) {
      return throwError(() => new Error('Token does not exist'));
    }

    const body = {
      action,
    };

    return this.http.put(`${this.apiUrl}/tokens/${token}/action`, body, {
      headers: this.tokenService.createAuthHeaders(authToken),
    });
  }

  private getRegistrationData(): void {
    const authToken = this.tokenService.getTokenFromStorage('authToken');

    if (!authToken || !this.checkAdminPermissions()) {
      this.registrationDataSubject.next(null);
      return;
    }

    this.http
      .get<ApiResponse<RegistrationData[]>>(
        `${this.apiUrl}/dashboard/registrations`,
        { headers: this.tokenService.createAuthHeaders(authToken) }
      )
      .pipe(map((response) => response.data))
      .subscribe((data) => {
        this.registrationDataSubject.next(data);
      });
  }

  getRegistrationDataObservable(): Observable<RegistrationData[] | null> {
    if (!this.isDataLoaded && this.registrationDataSubject.value === null) {
      this.getRegistrationData();
    }
    return this.registrationData$;
  }

  private getCreatedTokens(): void {
    const authToken = this.tokenService.getTokenFromStorage('authToken');

    if (!authToken || !this.checkAdminPermissions()) {
      this.activeTokensSubject.next(null);
      this.totalTokensSubject.next(null);
      this.activeAdminTokensSubject.next(null);
      this.totalAdminTokensSubject.next(null);
      return;
    }

    this.http
      .get<ApiResponse<CreatedTokens>>(`${this.apiUrl}/dashboard/tokens`, {
        headers: this.tokenService.createAuthHeaders(authToken),
      })
      .pipe(map((response) => response.data))
      .subscribe((data) => {
        this.activeTokensSubject.next(data?.activeTokens ?? 0);
        this.totalTokensSubject.next(data?.totalTokens ?? 0);
        this.activeAdminTokensSubject.next(data?.activeAdminTokens ?? 0);
        this.totalAdminTokensSubject.next(data?.totalAdminTokens ?? 0);
      });
  }

  getActiveTokensObservable(): Observable<number | null> {
    if (!this.isDataLoaded && this.activeTokensSubject.value === null) {
      this.getCreatedTokens();
    }
    return this.activeTokens$;
  }

  getTotalTokensObservable(): Observable<number | null> {
    if (!this.isDataLoaded && this.totalTokensSubject.value === null) {
      this.getCreatedTokens();
    }
    return this.totalTokens$;
  }

  getActiveAdminTokensObservable(): Observable<number | null> {
    if (!this.isDataLoaded && this.activeAdminTokensSubject.value === null) {
      this.getCreatedTokens();
    }
    return this.activeAdminTokens$;
  }

  getTotalAdminTokensObservable(): Observable<number | null> {
    if (!this.isDataLoaded && this.totalAdminTokensSubject.value === null) {
      this.getCreatedTokens();
    }
    return this.totalAdminTokens$;
  }

  private getRequestsData(): void {
    const authToken = this.tokenService.getTokenFromStorage('authToken');

    if (!authToken || !this.checkAdminPermissions()) {
      this.requestsDataSubject.next(null);
      return;
    }

    this.http
      .get<ApiResponse<CombinedRequestsData>>(`${this.apiUrl}/logs/stats`, {
        headers: this.tokenService.createAuthHeaders(authToken),
      })
      .pipe(map((response) => response.data))
      .subscribe((data) => {
        this.requestsDataSubject.next(data);
      });
  }

  getRequestsDataObservable(): Observable<CombinedRequestsData | null> {
    if (!this.isDataLoaded && this.requestsDataSubject.value === null) {
      this.getRequestsData();
    }
    return this.requestsData$;
  }

  private getUsersByCountry(): void {
    const authToken = this.tokenService.getTokenFromStorage('authToken');

    if (!authToken || !this.checkAdminPermissions()) {
      this.userCountryStatsSubject.next(null);
      return;
    }

    this.http
      .get<ApiResponse<CountryStats[]>>(`${this.apiUrl}/stats/country`, {
        headers: this.tokenService.createAuthHeaders(authToken),
      })
      .pipe(map((response) => response.data))
      .subscribe((data) => {
        this.userCountryStatsSubject.next(data);
      });
  }

  getCountryUsersDataObservable(): Observable<CountryStats[] | null> {
    if (!this.isDataLoaded && this.userCountryStatsSubject.value === null) {
      this.getUsersByCountry();
    }
    return this.userCountryStats$;
  }

  private getRoleStats(): void {
    const authToken = this.tokenService.getTokenFromStorage('authToken');

    if (!authToken || !this.checkAdminPermissions()) {
      this.userRoleStatsSubject.next(null);
      return;
    }

    this.http
      .get<ApiResponse<RoleStats[]>>(`${this.apiUrl}/stats/roles`, {
        headers: this.tokenService.createAuthHeaders(authToken),
      })
      .pipe(map((response) => response.data))
      .subscribe((data) => {
        this.userRoleStatsSubject.next(data);
      });
  }

  getRoleStatsDataObservable(): Observable<RoleStats[] | null> {
    if (!this.isDataLoaded && this.userRoleStatsSubject.value === null) {
      this.getRoleStats();
    }

    return this.userRoleStats$;
  }

  private getBlockStats(): void {
    const authToken = this.tokenService.getTokenFromStorage('authToken');

    if (!authToken || !this.checkAdminPermissions()) {
      this.userBlockStatsSubject.next(null);
      return;
    }

    this.http
      .get<ApiResponse<BlockStats[]>>(`${this.apiUrl}/stats/blocked`, {
        headers: this.tokenService.createAuthHeaders(authToken),
      })
      .pipe(map((response) => response.data))
      .subscribe((data) => {
        this.userBlockStatsSubject.next(data);
      });
  }

  getBlockStatsDataObservable(): Observable<BlockStats[] | null> {
    if (!this.isDataLoaded && this.userBlockStatsSubject.value === null) {
      this.getBlockStats();
    }
    return this.userBlockStats$;
  }

  private getRequestLogData(): void {
    const authToken = this.tokenService.getTokenFromStorage('authToken');

    if (!authToken || !this.checkAdminPermissions()) {
      this.requestLogsDataSubject.next(null);
      return;
    }

    this.http
      .get<ApiResponse<RequestLog[]>>(`${this.apiUrl}/logs`, {
        headers: this.tokenService.createAuthHeaders(authToken),
      })
      .pipe(map((response) => response.data))
      .subscribe((data) => {
        this.requestLogsDataSubject.next(data);
      });
  }

  getRequestLogsDataObservable(): Observable<RequestLog[] | null> {
    if (!this.isDataLoaded && this.requestLogsDataSubject.value === null) {
      this.getRequestLogData();
    }

    return this.requestLogsData$;
  }

  private getAuthLogData(): void {
    const authToken = this.tokenService.getTokenFromStorage('authToken');

    if (!authToken || !this.checkAdminPermissions()) {
      this.authLogsDataSubject.next(null);
      return;
    }

    this.http
      .get<ApiResponse<AuthLog[]>>(`${this.apiUrl}/logs/auth`, {
        headers: this.tokenService.createAuthHeaders(authToken),
      })
      .pipe(map((response) => response.data))
      .subscribe((data) => {
        this.authLogsDataSubject.next(data);
      });
  }

  getAuthLogDataObservable(): Observable<AuthLog[] | null> {
    if (!this.isDataLoaded && this.authLogsDataSubject.value === null) {
      this.getAuthLogData();
    }

    return this.authLogsData$;
  }

  private getErrorLogData(): void {
    const authToken = this.tokenService.getTokenFromStorage('authToken');

    if (!authToken || !this.checkAdminPermissions()) {
      this.errorLogsDataSubject.next(null);
      return;
    }

    this.http
      .get<ApiResponse<ErrorLog[]>>(`${this.apiUrl}/logs/errors`, {
        headers: this.tokenService.createAuthHeaders(authToken),
      })
      .pipe(map((response) => response.data))
      .subscribe((data) => {
        this.errorLogsDataSubject.next(data);
      });
  }

  getErrorLogDataObservable(): Observable<ErrorLog[] | null> {
    if (!this.isDataLoaded && this.errorLogsDataSubject.value === null) {
      this.getErrorLogData();
    }

    return this.errorLogsData$;
  }

  checkAdminPermissions(): boolean {
    const role = this.tokenService.getUserRole();
    return role == 'Admin' || role == 'Owner';
  }
}
