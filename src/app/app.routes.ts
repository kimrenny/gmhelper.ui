import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { SettingsComponent } from './settings/settings.component';
import { TokenService } from './services/token.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { AdminComponent } from './admin/admin.component';

const canActivateAdmin = () => {
  const tokenService = inject(TokenService);
  return tokenService.userRole$.pipe(
    map((role) => role === 'Admin' || role === 'Owner')
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
