import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  Observable,
  throwError,
  of,
  mergeMap,
  retry,
  tap,
  delayWhen,
  timer,
  finalize,
} from 'rxjs';

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
  private isServerAvailableSubject = new BehaviorSubject<boolean>(false);
  isServerAvailable$ = this.isServerAvailableSubject.asObservable();

  private refreshingToken = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

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
          this.isServerAvailableSubject.next(true);
        }),
        catchError((error) => this.handleLoadUserError(error, token, attempts))
      );
  }

  private handleLoadUserError(
    error: any,
    token: string,
    attempts: number
  ): Observable<UserDetails | never> {
    console.error('Error loading user details', error);

    if (error.status === 0) {
      this.isServerAvailableSubject.next(false);
      if (attempts < 2) {
        console.warn('Retrying request due to server unavailabbility...');
        return this.retryLoadUserDetails(token, attempts + 1);
      } else {
        console.warn('Server is unavailable. Keeping the user authorized.');
        return throwError(() => new Error('Server is unavailable'));
      }
    }

    if (
      [
        'User is blocked.',
        'User not found.',
        'Invalid data.',
        'Invalid token.',
      ].includes(error.error)
    ) {
      this.isAuthorizedSubject.next(false);
      localStorage.removeItem('authToken');
    }
    this.isServerAvailableSubject.next(true);

    console.error(`Unknown error: ${error.error}`);
    return throwError(() => new Error('Failed to load user details'));
  }

  private retryLoadUserDetails(
    token: string,
    attempts: number
  ): Observable<UserDetails> {
    return new Observable<UserDetails>((observer) => {
      setTimeout(() => {
        this.loadUserDetails(token, attempts).subscribe({
          next: (data) => observer.next(data),
          error: (err) => observer.error(err),
          complete: () => observer.complete(),
        });
      }, 5000);
    });
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
    if (this.refreshingToken) {
      return this.refreshTokenSubject.pipe(
        mergeMap((newAccessToken) => {
          if (!newAccessToken) {
            throw new Error('Refresh token failed');
          }
          return of({
            accessToken: newAccessToken,
            refreshToken,
          });
        })
      );
    }

    this.refreshingToken = true;

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
        retry({
          count: 2,
          delay: (error, retryAttempt) => {
            console.warn(
              `Retrying refresh token request (attempt ${retryAttempt + 1})...`
            );
            return timer(5000);
          },
        }),
        tap((response) => {
          console.log(response);
          localStorage.setItem('authToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          this.refreshTokenSubject.next(response.accessToken);
          this.refreshingToken = false;
          this.isAuthorizedSubject.next(true);
        }),
        catchError((error) => {
          console.error('Error refreshing token', error);
          this.refreshingToken = false;
          this.refreshTokenSubject.next(null);
          return throwError(() => new Error('Failed to refresh token'));
        }),
        finalize(() => {
          this.refreshingToken = false;
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
