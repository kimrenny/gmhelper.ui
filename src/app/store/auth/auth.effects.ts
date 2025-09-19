import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, timer } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
import * as UserActions from '../user/user.actions';
import { TokenService } from '../../services/token.service';

@Injectable()
export class AuthEffects {
  constructor(private actions$: Actions, private tokenService: TokenService) {}

  restoreAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.restoreAuthFromStorage),
      map(() => {
        const accessToken = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (accessToken && refreshToken) {
          const isExpired = this.tokenService.isTokenExpired(accessToken);

          if (isExpired) {
            return AuthActions.refreshToken({ refreshToken });
          }

          const role = this.tokenService.extractUserRole(accessToken);
          return AuthActions.loginSuccess({ accessToken, refreshToken, role });
        }
        return AuthActions.logout();
      })
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(({ accessToken, refreshToken }) => {
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      }),
      switchMap(() => of(UserActions.initUser()))
    )
  );

  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      switchMap(({ refreshToken }) =>
        this.tokenService.refreshToken(refreshToken).pipe(
          mergeMap((response) => {
            localStorage.setItem('authToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            const role = this.tokenService.extractUserRole(
              response.accessToken
            );
            return [
              AuthActions.refreshTokenSuccess({
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
              }),
              AuthActions.loginSuccess({
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
                role,
              }),
            ];
          }),
          catchError((error) => {
            if (error.status === 0 || error.status === 429) {
              return timer(5000).pipe(
                mergeMap(() => of(AuthActions.refreshToken({ refreshToken })))
              );
            }
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            return of(AuthActions.refreshTokenFailure({ error }));
          })
        )
      )
    )
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
        }),
        map(() => UserActions.clearUser())
      ),
    { dispatch: true }
  );
}
