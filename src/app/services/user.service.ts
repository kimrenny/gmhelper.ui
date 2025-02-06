import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  Observable,
  throwError,
  tap,
  switchMap,
  timer,
  of,
} from 'rxjs';
import { TokenService } from './token.service';

interface UserDetails {
  avatar: string | null;
  nickname: string;
}

enum CriticalErrors {
  UserBlocked = 'User is blocked.',
  UserNotFound = 'User not found.',
  InvalidData = 'Invalid data.',
  InvalidToken = 'Invalid token.',
  Unauthorized = 'Unauthorized',
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

  private readonly criticalErrors = new Set<string>(
    Object.values(CriticalErrors)
  );

  private readonly api = 'https://localhost:7057/api';

  constructor(private http: HttpClient, private tokenService: TokenService) {
    this.initializeAuthentication();
  }

  private getAuthToken(): string | null {
    return this.tokenService.getTokenFromStorage('authToken');
  }

  private getRefreshToken(): string | null {
    return this.tokenService.getTokenFromStorage('refreshToken');
  }

  private initializeAuthentication(): void {
    const authToken = this.getAuthToken();
    const refreshToken = this.getRefreshToken();

    if (!authToken && !refreshToken) {
      console.warn('No tokens found in localStorage.');
      return;
    }

    this.tokenService
      .ensureTokenValidity(authToken, refreshToken)
      .pipe(
        switchMap((accessToken) => this.loadUserDetails(accessToken)),
        catchError((err) => {
          console.warn(
            `Failed to load user details during initialization.`,
            err
          );
          return of(null);
        })
      )
      .subscribe();
  }

  getUserDetails(): UserDetails {
    return this.userSubject.getValue();
  }

  loadUserDetails(token: string, attempts = 0): Observable<UserDetails> {
    return this.http
      .get<UserDetails>(`${this.api}/user/details`, {
        headers: this.tokenService.createAuthHeaders(token),
      })
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
        const retryDelay = Math.pow(2, attempts) * 10000;
        console.warn(`Retrying in ${retryDelay / 1000} sec...`);
        return timer(retryDelay).pipe(
          switchMap(() => this.loadUserDetails(token, attempts + 1))
        );
      } else {
        return throwError(() => new Error('Server is unavailable'));
      }
    }

    if (error.message === 'User token is not active.') {
      this.clearUser();
      return throwError(() => new Error('User token is not active'));
    }

    if (this.criticalErrors.has(error.message)) {
      console.warn(`Clearing user due to critical error:, ${error.message}`);
      this.clearUser();
    }

    this.isServerAvailableSubject.next(true);
    return throwError(() => new Error('Failed to load user details'));
  }

  updateUser(userDetails: UserDetails) {
    this.userSubject.next(userDetails);
  }

  checkAuthentication(callback?: () => void): void {
    const authToken = this.tokenService.getTokenFromStorage('authToken');
    const refreshToken = this.tokenService.getTokenFromStorage('refreshToken');

    this.tokenService.ensureTokenValidity(authToken, refreshToken).subscribe({
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

  getLoggedDevices(): Observable<any> {
    const token = this.tokenService.getTokenFromStorage('authToken');
    if (!token) {
      return throwError(() => new Error('Token does not exist'));
    }

    return this.http.get<any[]>(`${this.api}/user/devices`, {
      headers: this.tokenService.createAuthHeaders(token),
    });
  }

  updateUserData(formData: FormData): Observable<any> {
    const token = this.tokenService.getTokenFromStorage('authToken');

    if (!token) {
      return throwError(() => new Error('Token does not exist'));
    }

    return this.http.put(`${this.api}/user/update`, formData, {
      headers: this.tokenService.createAuthHeaders(token),
    });
  }

  uploadAvatar(avatar: File): Observable<any> {
    const token = this.tokenService.getTokenFromStorage('authToken');

    if (!token) {
      return throwError(() => new Error('Token does not exist'));
    }

    const formData = new FormData();
    formData.append('avatar', avatar);

    return this.http.post(`${this.api}/user/upload-avatar`, formData, {
      headers: this.tokenService.createAuthHeaders(token),
    });
  }

  deactivateDevice(device: any): Observable<any> {
    const token = this.tokenService.getTokenFromStorage('authToken');
    if (!token) {
      return throwError(() => new Error('Token does not exist'));
    }

    return this.http.patch(
      `${this.api}/user/devices/deactivate`,
      {
        userAgent: device.userAgent,
        platform: device.platform,
        ipAddress: device.ipAddress,
      },
      { headers: this.tokenService.createAuthHeaders(token) }
    );
  }

  clearUser(): void {
    this.tokenService.clearTokens();
    this.isAuthorizedSubject.next(false);
    this.userSubject.next({
      avatar: null,
      nickname: 'Guest',
    });
  }
}
