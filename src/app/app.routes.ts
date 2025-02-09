import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { SettingsComponent } from './settings/settings.component';
import { TokenService } from './services/token.service';
import { inject } from '@angular/core';
import { filter, map, switchMap } from 'rxjs';
import { AdminComponent } from './admin/admin.component';
import { UserService } from './services/user.service';

const canActivateAdmin = () => {
  const tokenService = inject(TokenService);
  const userService = inject(UserService);

  return userService.isAuthorized$.pipe(
    filter((isAuthorized) => isAuthorized),
    map(() => tokenService.userRole$),
    switchMap((role$) =>
      role$.pipe(map((role) => role === 'Admin' || role === 'Owner'))
    )
  );
};

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'settings', component: SettingsComponent },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [canActivateAdmin],
  },
  { path: '**', redirectTo: '' },
];
