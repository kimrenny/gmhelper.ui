import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  Observable,
  throwError,
  tap,
  timer,
  finalize,
  filter,
  take,
  map,
  switchMap,
  shareReplay,
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

  constructor(private http: HttpClient) {
    this.initializeAuthentication();
  }

  private initializeAuthentication(): void {
    console.log('initializeAuthentication is called.');
    const authToken = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!authToken && !refreshToken) {
      this.clearUser();
      return;
    }

    this.ensureTokenValidity(authToken, refreshToken)
      .pipe(shareReplay(1))
      .subscribe({
        next: (accessToken) => {
          this.loadUserDetails(accessToken).subscribe();
        },
        error: () => {
          console.warn('Authentication failed during initialization.');
        },
      });
  }

  private ensureTokenValidity(
    authToken: string | null,
    refreshToken: string | null
  ): Observable<string> {
    if (authToken && !this.isTokenExpired(authToken, 5 * 60 * 1000)) {
      return new BehaviorSubject(authToken).asObservable();
    }

    if (refreshToken) {
      return this.refreshToken(refreshToken).pipe(
        map((tokens) => tokens.accessToken)
      );
    }

    this.clearUser();
    return throwError(() => new Error('No valid token available'));
  }

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
    this.isAuthorizedSubject.next(false);
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

    if (error.message === 'User token is not active.') {
      this.clearUser();
      console.warn('User token is not active, user is logged out.');
      return throwError(() => new Error('User token is not active'));
    }

    if (
      [
        'User is blocked.',
        'User not found.',
        'Invalid data.',
        'Invalid token.',
        'Unauthorized',
      ].includes(error.message) ||
      error.status === 401 ||
      error.status === 404
    ) {
      this.clearUser();
      console.log('user is removed.');
    }
    this.isServerAvailableSubject.next(true);

    console.error(`Unknown error: ${JSON.stringify(error.message)}`);
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
      }, 10000);
    });
  }

  updateUser(userDetails: UserDetails) {
    this.userSubject.next(userDetails);
  }

  checkAuthentication(callback?: () => void): void {
    const authToken = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');

    this.ensureTokenValidity(authToken, refreshToken).subscribe({
      next: (accessToken) => {
        this.loadUserDetails(accessToken).subscribe({
          next: () => {
            if (callback) callback();
          },
          error: (err) => {
            console.warn('Failed to load user details:', err);
            this.clearUser();
          },
        });
      },
      error: (err) => {
        console.warn('Authentication failed:', err);
        this.clearUser();
      },
    });
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
    refreshToken: string,
    attempts: number = 0
  ): Observable<{ accessToken: string; refreshToken: string }> {
    if (this.refreshingToken) {
      console.log('Token refresh already in progress, waiting...');
      return this.refreshTokenSubject.pipe(
        filter((token): token is string => token !== null),
        take(1),
        map((newAccessToken: string) => ({
          accessToken: newAccessToken,
          refreshToken,
        }))
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
        tap((response) => {
          console.log(response);
          localStorage.setItem('authToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          this.refreshTokenSubject.next(response.accessToken);
          this.isAuthorizedSubject.next(true);
        }),
        catchError((error) =>
          this.handleRefreshTokenError(error, refreshToken, attempts)
        ),
        finalize(() => {
          this.refreshingToken = false;
        })
      );
  }

  private handleRefreshTokenError(
    error: any,
    refreshToken: string,
    attempts: number
  ): Observable<{ accessToken: string; refreshToken: string }> {
    console.error('Failed to refresh token:', error);
    if (error.status === 0) {
      console.warn('Server unavailable...');
      this.isServerAvailableSubject.next(false);

      if (attempts < 3) {
        console.warn(`Server unavailable, retrying (attempt ${attempts + 1})`);
        this.refreshingToken = false;
        return timer(5000).pipe(
          switchMap(() => this.refreshToken(refreshToken, attempts + 1))
        );
      }

      console.error('Failed to refresh token after multiple attempts.');
      return throwError(() => new Error('Temporary server unavailability.'));
    }

    if (error.status === 400 || error.status === 401) {
      console.error('Invalid token, clearing user data.');
      this.clearUser();
    }

    if (error.status === 409) {
      console.warn('Another refresh token request is already in progress.');
    }

    this.refreshTokenSubject.next(null);
    return throwError(() => new Error('Failed to refresh token'));
  }

  getLoggedDevices(): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any[]>('https://localhost:7057/api/user/devices', {
      headers,
    });
  }

  updateUserData(formData: FormData): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.put('https://localhost:7057/api/user/update', formData, {
      headers,
    });
  }

  uploadAvatar(avatar: File): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const formData = new FormData();
    formData.append('avatar', avatar);

    return this.http.post(
      'https://localhost:7057/api/user/upload-avatar',
      formData,
      { headers }
    );
  }

  deactivateDevice(device: any): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.patch(
      `https://localhost:7057/api/user/devices/deactivate`,
      {
        userAgent: device.userAgent,
        platform: device.platform,
        ipAddress: device.ipAddress,
      },
      { headers }
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
