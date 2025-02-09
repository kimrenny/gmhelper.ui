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

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl = 'https://localhost:7057/api/admin';
  private usersSubject = new BehaviorSubject<User[] | null>(null);
  users$ = this.usersSubject.asObservable();

  private tokensSubject = new BehaviorSubject<Token[] | null>(null);
  tokens$ = this.tokensSubject.asObservable();

  constructor(private http: HttpClient, private tokenService: TokenService) {
    this.getAllUsers();
    this.getAllTokens();
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
}
