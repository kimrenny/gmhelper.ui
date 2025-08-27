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
import { map, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(
    private adminService: AdminService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.tokenService.userRole$.pipe(
      switchMap((role) => {
        if (role === 'Admin' || role === 'Owner') {
          return [true];
        }
        this.router.navigate(['/'], {
          queryParams: { section: 'welcome' },
          replaceUrl: true,
        });
        return [false];
      })
    );
  }
}
