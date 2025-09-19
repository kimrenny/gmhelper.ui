import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { TokenService } from '../services/token.service';
import { catchError, filter, map, Observable, of, switchMap, take } from 'rxjs';
import { Store } from '@ngrx/store';
import * as AuthSelectors from '../store/auth/auth.selectors';
import * as UserActions from '../store/user/user.actions';
import * as AuthActions from '../store/auth/auth.actions';
import * as AuthState from '../store/auth/auth.state';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(
    private store: Store<AuthState.AuthState>,
    private tokenService: TokenService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.store.select(AuthSelectors.selectIsAuthChecked).pipe(
      switchMap((checked) => {
        if (!checked) {
          return this.store.select(AuthSelectors.selectIsAuthChecked).pipe(
            filter((c) => c === true),
            take(1),
            switchMap(() => this.checkRoleAndToken())
          );
        }
        return this.checkRoleAndToken();
      })
    );
  }

  private checkRoleAndToken(): Observable<boolean> {
    return this.store.select(AuthSelectors.selectAccessToken).pipe(
      take(1),
      switchMap((token) => {
        if (!token) {
          this.router.navigate(['/'], {
            queryParams: { section: 'welcome' },
            replaceUrl: true,
          });
          return of(false);
        }

        return this.store.select(AuthSelectors.selectUserRole).pipe(
          take(1),
          map((role) => {
            if (role === 'Admin' || role === 'Owner') return true;

            this.router.navigate(['/'], {
              queryParams: { section: 'welcome' },
              replaceUrl: true,
            });
            return false;
          })
        );
      })
    );
  }
}
