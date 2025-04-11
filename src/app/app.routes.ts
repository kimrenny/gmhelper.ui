import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { SettingsComponent } from './settings/settings.component';
import { AdminComponent } from './admin/admin.component';
import { AdminGuard } from './guards/admin.guard';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { confirmEmailGuard } from './guards/confirm-email.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'settings', component: SettingsComponent },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'confirm',
    component: ConfirmEmailComponent,
    canActivate: [confirmEmailGuard],
  },
  { path: '**', redirectTo: '' },
];
