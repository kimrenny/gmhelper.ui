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

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl = 'https://localhost:7057/api/admin';
  private usersSubject = new BehaviorSubject<User[] | null>(null);
  users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient, private tokenService: TokenService) {}

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
}
