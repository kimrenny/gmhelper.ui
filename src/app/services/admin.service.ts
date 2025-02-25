import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, switchMap, throwError } from 'rxjs';
import { TokenService } from './token.service';

interface DeviceInfo {
  userAgent: string;
  platform: string;
}

interface LoginToken {
  expiration: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  isActive: boolean;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  registrationDate: string;
  isBlocked: boolean;
  loginTokens: LoginToken[];
}

interface Token {
  id: string;
  token: string;
  expiration: string;
  refreshTokenExpiration: string;
  userId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  isActive: boolean;
}

interface RequestsData {
  date: string;
  count: number;
}

interface RegistrationData {
  date: string;
  registrations: number;
}

interface CreatedTokens {
  activeTokens: number;
  totalTokens: number;
  activeAdminTokens: number;
  totalAdminTokens: number;
}

interface CountryStats {
  country: string;
  count: number;
}

interface RoleStats {
  role: string;
  count: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl = 'https://localhost:7057/api/admin';
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

  private requestsDataSubject = new BehaviorSubject<RequestsData[] | null>(
    null
  );
  requestsData$ = this.requestsDataSubject.asObservable();

  private userCountryStatsSubject = new BehaviorSubject<CountryStats[] | null>(
    null
  );
  userCountryStats$ = this.userCountryStatsSubject.asObservable();

  private userRoleStatsSubject = new BehaviorSubject<RoleStats[] | null>(null);
  userRoleStats$ = this.userRoleStatsSubject.asObservable();

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
            return this.http.get<User[]>(`${this.apiUrl}/users`, {
              headers: this.tokenService.createAuthHeaders(token),
            });
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
            return this.http.get<Token[]>(`${this.apiUrl}/tokens`, {
              headers: this.tokenService.createAuthHeaders(token),
            });
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
            return this.http.get<RegistrationData[]>(
              `${this.apiUrl}/dashboard/registrations`,
              { headers: this.tokenService.createAuthHeaders(authToken) }
            );
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
            return this.http.get<CreatedTokens>(
              `${this.apiUrl}/dashboard/tokens`,
              {
                headers: this.tokenService.createAuthHeaders(authToken),
              }
            );
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
            return this.http.get<RequestsData[]>(
              `${this.apiUrl}/logs/requests`,
              { headers: this.tokenService.createAuthHeaders(authToken) }
            );
          } else {
            return new Observable<RequestsData[] | null>((observer) => {
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

  getRequestsDataObservable(): Observable<RequestsData[] | null> {
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
            return this.http.get<CountryStats[]>(
              `${this.apiUrl}/country-rating`,
              { headers: this.tokenService.createAuthHeaders(authToken) }
            );
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
            return this.http.get<RoleStats[]>(`${this.apiUrl}/role-stats`, {
              headers: this.tokenService.createAuthHeaders(authToken),
            });
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

  checkAdminPermissions(role: string | null): boolean {
    return role == 'Admin' || role == 'Owner';
  }
}
