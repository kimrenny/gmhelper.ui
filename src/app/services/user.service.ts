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
    console.log('UserService instantiated from:', new Error().stack);
    this.initializeAuthentication();
  }

  private initializeAuthentication(): void {
    console.log('Initializing authentication process...');
    const authToken = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!authToken && !refreshToken) {
      console.warn('No tokens found in localStorage.');
      return;
    }

    this.ensureTokenValidity(authToken, refreshToken)
      .pipe(
        switchMap((accessToken) =>
          this.loadUserDetails(accessToken).pipe(
            catchError((err) => {
              console.warn(
                `Failed to load user details during initialization.`,
                err
              );
              return throwError(() => err);
            })
          )
        )
      )
      .subscribe({
        next: () => {
          console.log('Initialization completed successfully.');
        },
        error: (err) => {
          console.warn('Authentication failed during initialization:', err);
        },
      });
  }

  private ensureTokenValidity(
    authToken: string | null,
    refreshToken: string | null
  ): Observable<string> {
    console.log('Ensuring token validity...', { authToken, refreshToken });

    if (authToken && !this.isTokenExpired(authToken, 5 * 60 * 1000)) {
      console.log('Auth token is valid.');
      return new BehaviorSubject(authToken).asObservable();
    }

    if (refreshToken) {
      console.log('Auth token expired. Attempting to refresh token...');
      return this.refreshToken(refreshToken).pipe(
        map((tokens) => tokens.accessToken)
      );
    }

    console.warn('No valid tokens available. Clearing user data.');
    this.clearUser();
    return throwError(() => new Error('No valid token available'));
  }

  getUserDetails(): UserDetails {
    return this.userSubject.getValue();
  }

  loadUserDetails(token: string, attempts = 0): Observable<UserDetails> {
    console.log('Loading user details...', { token, attempts });

    return this.ensureTokenValidity(
      token,
      localStorage.getItem('refreshToken')
    ).pipe(
      switchMap((validToken) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${validToken}`,
        });
        return this.http.get<UserDetails>(
          'https://localhost:7057/api/user/details',
          { headers }
        );
      }),
      tap((userDetails) => {
        console.log('User details successfully loaded:', userDetails);
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
      console.warn('User token inactive, clearing user...');
      this.clearUser();
      return throwError(() => new Error('User token is not active'));
    }

    if (
      [
        'User is blocked.',
        'User not found.',
        'Invalid data.',
        'Invalid token.',
        'Unauthorized',
      ].includes(error.message)
    ) {
      console.warn('Clearing user due to critical error:', error.message);
      this.clearUser();
    }

    this.isServerAvailableSubject.next(true);

    console.warn(`Unexpected error: ${error.message}`);
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
    console.log('refreshToken:');
    console.log('this', this);
    console.log('this.refreshingToken', this.refreshingToken);
    if (this.refreshingToken) {
      //console.log('Token refresh already in progress, waiting...');
      return this.refreshTokenSubject.pipe(
        filter((token): token is string => token !== null),
        take(1),
        map((newAccessToken: string) => ({
          accessToken: newAccessToken,
          refreshToken,
        }))
      );
    }

    //console.log('Starting token refresh process...');
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
          //console.log('Token refresh successful:', response);
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
          //console.log('Token refresh process completed.');
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
        console.warn(`Retrying token refresh (attempt ${attempts + 1})`);
        this.refreshingToken = false;
        return timer(5000).pipe(
          switchMap(() => this.refreshToken(refreshToken, attempts + 1))
        );
      }

      console.error('Failed to refresh token after multiple attempts.');
      return throwError(() => new Error('Temporary server unavailability.'));
    }

    if (error.status === 400 || error.status === 401) {
      console.error('Invalid token. Clearing user data.');
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
