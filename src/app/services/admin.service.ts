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

  private requestsDataSubject = new BehaviorSubject<RequestsData[] | null>(
    null
  );
  requestsData$ = this.requestsDataSubject.asObservable();

  constructor(private http: HttpClient, private tokenService: TokenService) {
    this.getAllUsers();
    this.getAllTokens();
    this.getRegistrationData();
    this.getActiveTokens();
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

  getActiveTokens(): void {
    const authToken = this.tokenService.getTokenFromStorage('authToken');

    if (!authToken) {
      return;
    }

    this.tokenService.userRole$
      .pipe(
        switchMap((role) => {
          if (this.checkAdminPermissions(role)) {
            return this.http.get<any>(`${this.apiUrl}/dashboard/tokens`, {
              headers: this.tokenService.createAuthHeaders(authToken),
            });
          } else {
            return new Observable<any>((observer) => {
              observer.next(null);
              observer.complete();
            });
          }
        })
      )
      .subscribe((data) => {
        this.activeTokensSubject.next(data.activeTokens);
        this.totalTokensSubject.next(data.totalTokens);
      });
  }

  checkActiveTokens(): void {
    if (!this.activeTokensSubject.value) {
      this.getActiveTokens();
    }
  }

  getActiveTokensObservable(): Observable<number | null> {
    return this.activeTokens$;
  }

  getTotalTokensObservable(): Observable<number | null> {
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
        console.log(data);
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

  checkAdminPermissions(role: string | null): boolean {
    return role == 'Admin' || role == 'Owner';
  }
}
