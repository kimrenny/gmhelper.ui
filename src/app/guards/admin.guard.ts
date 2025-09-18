import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  GuardResult,
  MaybeAsync,
  Router,
} from '@angular/router';
import { AdminService } from '../services/admin.service';
import { TokenService } from '../services/token.service';
import { catchError, map, of, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(
    private adminService: AdminService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  canActivate() {
    const authToken = this.tokenService.getTokenFromStorage('authToken');
    const refreshToken = this.tokenService.getTokenFromStorage('refreshToken');

    return this.tokenService.ensureTokenValidity(authToken, refreshToken).pipe(
      map(() => {
        const role = this.tokenService.getUserRole();
        if (role === 'Admin' || role === 'Owner') {
          return true;
        }
        this.router.navigate(['/'], {
          queryParams: { section: 'welcome' },
          replaceUrl: true,
        });
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/'], {
          queryParams: { section: 'welcome' },
          replaceUrl: true,
        });
        return of(false);
      })
    );
  }
}
