import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  Observable,
  throwError,
  tap,
  switchMap,
  timer,
  of,
  map,
  take,
  first,
} from 'rxjs';
import { TokenService } from './token.service';
import { ApiResponse } from '../models/api-response.model';
import { environment } from 'src/environments/environment';
import { UserDetails } from '../models/user.model';
import { Store } from '@ngrx/store';
import * as UserActions from '../store/user/user.actions';
import * as UserSelectors from '../store/user/user.selectors';
import * as UserState from '../store/user/user.state';

enum Errors {
  UserBlocked = 'User is blocked.',
  UserNotFound = 'User not found.',
  InvalidData = 'Invalid data.',
  InvalidToken = 'Invalid token.',
  Unauthorized = 'Unauthorized',
  UserTokenNotActive = 'User token is not active.',
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly errors = new Set<string>(Object.values(Errors));

  private readonly api = `${environment.apiUrl}`;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private store: Store<UserState.UserState>
  ) {
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
        catchError(() => of(null))
      )
      .subscribe();
  }

  getUserDetails(): Observable<UserDetails> {
    return this.store.select(UserSelectors.selectUser);
  }

  loadUserDetails(token: string, attempts = 0): Observable<UserDetails> {
    this.store.dispatch(UserActions.setUserLoading({ isLoading: true }));

    return this.http
      .get<ApiResponse<UserDetails>>(`${this.api}/user/details`, {
        headers: this.tokenService.createAuthHeaders(token),
      })
      .pipe(
        map((response) => response.data),
        tap((userDetails) => {
          if (userDetails.avatar) {
            userDetails.avatar = `data:image/jpeg;base64,${userDetails.avatar}`;
          }
          userDetails.language = this.normalizeLanguage(userDetails.language);

          this.store.dispatch(UserActions.setUser({ user: userDetails }));
          this.store.dispatch(
            UserActions.setAuthorized({ isAuthorized: true })
          );
          this.store.dispatch(
            UserActions.setServerAvailable({ isAvailable: true })
          );
          this.store.dispatch(UserActions.setUserLoading({ isLoading: false }));
        }),
        catchError((error) => {
          this.store.dispatch(UserActions.setUserLoading({ isLoading: false }));
          return this.handleLoadUserError(error, token, attempts);
        })
      );
  }

  private handleLoadUserError(
    error: any,
    token: string,
    attempts: number
  ): Observable<UserDetails | never> {
    console.error('Error loading user details', error);
    this.store.dispatch(UserActions.setAuthorized({ isAuthorized: false }));

    if (error.status === 0) {
      this.store.dispatch(
        UserActions.setServerAvailable({ isAvailable: false })
      );
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

    if (this.errors.has(error.error?.message)) {
      console.warn(`Clearing user due to error:, ${error.message}`);
      this.clearUser();
    }

    this.store.dispatch(UserActions.setServerAvailable({ isAvailable: true }));
    return throwError(() => new Error('Failed to load user details'));
  }

  updateUser(userDetails: UserDetails) {
    this.store.dispatch(UserActions.setUser({ user: userDetails }));
  }

  checkAuthentication(callback?: () => void): void {
    this.store
      .select(UserSelectors.selectIsUserLoading)
      .pipe(take(1))
      .subscribe((isLoading) => {
        if (isLoading) return;

        this.store
          .select(UserSelectors.selectUser)
          .pipe(first())
          .subscribe((currentUser) => {
            const isDefaultUser =
              currentUser.avatar === null &&
              currentUser.nickname === 'Guest' &&
              currentUser.language === 'en';

            if (!isDefaultUser) return;

            const authToken =
              this.tokenService.getTokenFromStorage('authToken');
            const refreshToken =
              this.tokenService.getTokenFromStorage('refreshToken');

            this.tokenService
              .ensureTokenValidity(authToken, refreshToken)
              .subscribe({
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
          });
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

    return this.http.patch(`${this.api}/user/profile`, formData, {
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

    return this.http.post(`${this.api}/user/avatar`, formData, {
      headers: this.tokenService.createAuthHeaders(token),
    });
  }

  updateLanguage(
    language: 'de' | 'en' | 'fr' | 'ja' | 'ko' | 'ru' | 'ua' | 'zh'
  ): Observable<any> {
    const token = this.tokenService.getTokenFromStorage('authToken');

    if (!token) {
      return throwError(() => new Error('Token does not exist'));
    }

    const url = `${this.api}/user/profile/language`;
    const body = { language: language.toUpperCase() };
    const headers = this.tokenService.createAuthHeaders(token);

    return this.http.patch(url, body, { headers }).pipe(
      tap({
        next: () => {
          this.loadUserDetails(token).subscribe((result) => {});
        },
      })
    );
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
    this.store.dispatch(UserActions.clearUser());
  }

  private normalizeLanguage(lang: string): UserDetails['language'] {
    const listLangs: UserDetails['language'][] = [
      'en',
      'de',
      'fr',
      'ja',
      'ko',
      'ru',
      'ua',
      'zh',
    ];

    if (!lang) return 'en';
    const normalized = lang.toLowerCase() as UserDetails['language'];
    return listLangs.includes(normalized) ? normalized : 'en';
  }
}
