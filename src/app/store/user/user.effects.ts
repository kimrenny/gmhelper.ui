import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  catchError,
  map,
  Observable,
  of,
  switchMap,
  tap,
  timer,
  withLatestFrom,
} from 'rxjs';
import * as UserActions from '../../store/user/user.actions';
import { UserService } from 'src/app/services/user.service';
import { TokenService } from 'src/app/services/token.service';
import * as UserState from '../../store/user/user.state';
import { Store } from '@ngrx/store';
import { selectUser } from './user.selectors';

@Injectable()
export class UserEffects {
  initUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.initUser),
      withLatestFrom(
        this.store.select(selectUser),
        this.store.select((state: UserState.UserState) => state.isUserLoading)
      ),
      switchMap(([action, user, isLoading]) => {
        if (user.nickname !== 'Guest' || isLoading) {
          return of(UserActions.loadUserSuccess({ user }));
        }

        const authToken = this.tokenService.getTokenFromStorage('authToken');
        const refreshToken =
          this.tokenService.getTokenFromStorage('refreshToken');

        if (!authToken && !refreshToken) {
          return of(UserActions.loadUserFailure());
        }

        return this.tokenService
          .ensureTokenValidity(authToken, refreshToken)
          .pipe(
            switchMap((validToken) => this.tryLoadUser(validToken, 0)),
            catchError(() => of(UserActions.loadUserFailure()))
          );
      })
    )
  );

  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUser),
      switchMap(() => {
        const token = this.tokenService.getTokenFromStorage('authToken');
        if (!token) return of(UserActions.loadUserFailure());

        return this.tryLoadUser(token, 0);
      })
    )
  );

  private tryLoadUser(token: string, attempt: number): Observable<any> {
    this.store.dispatch(UserActions.setUserLoading({ isLoading: true }));

    return this.userService.loadUserDetails(token).pipe(
      map((user) => {
        this.store.dispatch(UserActions.setUser({ user }));
        this.store.dispatch(UserActions.setAuthorized({ isAuthorized: true }));
        this.store.dispatch(
          UserActions.setServerAvailable({ isAvailable: true })
        );
        this.store.dispatch(UserActions.setUserLoading({ isLoading: false }));
        return UserActions.loadUserSuccess({ user });
      }),
      catchError((error) => {
        this.store.dispatch(UserActions.setUserLoading({ isLoading: false }));

        if (error.status === 0 || error.status === 429) {
          if (attempt < 3) {
            const delayTime = Math.pow(2, attempt) * 5000;
            console.log(
              `%c[NgRx] Retry loading user in ${delayTime / 1000}s (attempt ${
                attempt + 1
              })`,
              'color: orange;'
            );
            return timer(delayTime).pipe(
              switchMap(() => this.tryLoadUser(token, attempt + 1))
            );
          } else {
            this.store.dispatch(
              UserActions.setServerAvailable({ isAvailable: false })
            );
            return of(UserActions.loadUserFailure());
          }
        }

        if (
          ['User is blocked.', 'User not found.'].includes(error.error?.message)
        ) {
          this.store.dispatch(UserActions.clearUser());
        }

        this.store.dispatch(
          UserActions.setServerAvailable({ isAvailable: true })
        );
        return of(UserActions.loadUserFailure());
      })
    );
  }

  updateUserLanguage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUserLanguage),
      switchMap(({ language }) => {
        const token = this.tokenService.getTokenFromStorage('authToken');
        if (!token) return of(UserActions.loadUserFailure());

        return this.userService.updateLanguage(language).pipe(
          switchMap(() => this.tryLoadUser(token, 0)),
          catchError(() => of(UserActions.loadUserFailure()))
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private userService: UserService,
    private tokenService: TokenService,
    private store: Store<UserState.UserState>
  ) {}
}
