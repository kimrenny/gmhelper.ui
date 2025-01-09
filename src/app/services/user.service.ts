import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { tap } from 'rxjs';

interface UserDetails {
  avatar: string | null;
  nickname: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userSubject = new BehaviorSubject<UserDetails>({
    avatar: null,
    nickname: 'Guest',
  });

  user$ = this.userSubject.asObservable();
  private isAuthorizedSubject = new BehaviorSubject<boolean>(false);
  isAuthorized$ = this.isAuthorizedSubject.asObservable();

  constructor(private http: HttpClient) {}

  getUserDetails(): UserDetails {
    return this.userSubject.getValue();
  }

  loadUserDetails(token: string, attempts = 0): Observable<UserDetails> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .get<UserDetails>('https://localhost:7057/api/user/details', { headers })
      .pipe(
        tap((userDetails) => {
          if (userDetails.avatar) {
            userDetails.avatar = `data:image/jpeg;base64,${userDetails.avatar}`;
          }
          this.userSubject.next(userDetails);
          this.isAuthorizedSubject.next(true);
        }),
        catchError((error) => {
          console.error('Error loading user details', error);
          switch (error.error) {
            case 'User is blocked.':
            case 'User not found.':
            case 'Invalid data.':
            case 'Invalid token.':
              this.isAuthorizedSubject.next(false);
              localStorage.removeItem('authToken');
              break;
            default:
              this.isAuthorizedSubject.next(false);
              console.error(
                `Unknown error: ${error.error}. Attempt ${++attempts}`
              );
              if (attempts >= 3) {
                attempts = 0;
                break;
              }
              setTimeout(() => this.loadUserDetails(token, attempts), 5000);
              break;
          }
          return throwError(() => new Error('Failed to load user details'));
        })
      );
  }

  updateUser(userDetails: UserDetails) {
    this.userSubject.next(userDetails);
  }

  checkAuthentication(): void {
    const authToken = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (authToken && !this.isTokenExpired(authToken)) {
      this.loadUserDetails(authToken).subscribe();
    } else if (refreshToken) {
      this.refreshToken(refreshToken).subscribe({
        next: (tokens) => {
          this.loadUserDetails(tokens.accessToken).subscribe();
        },
        error: (err) => {
          console.error('Error refreshing token', err);
          this.clearUser();
        },
      });
    } else {
      this.clearUser();
    }
  }

  isTokenExpired(token: string, bufferTime: number = 5 * 60 * 1000): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      return Date.now() >= exp - bufferTime;
    } catch (error) {
      console.error('Invalid token format', error);
      return true;
    }
  }

  refreshToken(
    refreshToken: string
  ): Observable<{ accessToken: string; refreshToken: string }> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post<{ accessToken: string; refreshToken: string }>(
        'https://localhost:7057/api/user/refresh-token',
        JSON.stringify({ refreshToken }),
        { headers }
      )
      .pipe(
        tap((response) => {
          localStorage.setItem('authToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          this.isAuthorizedSubject.next(true);
        }),
        catchError((error) => {
          console.error('Error refreshing token', error);
          return throwError(() => new Error('Failed to refresh token'));
        })
      );
  }

  clearUser(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    this.isAuthorizedSubject.next(false);
    this.userSubject.next({
      avatar: null,
      nickname: 'Guest',
    });
  }
}
