import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { SettingsComponent } from './settings/settings.component';
import { AdminComponent } from './admin/admin.component';
import { AdminGuard } from './guards/admin.guard';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { emailTokenGuard } from './guards/email-token.guard';
import { PasswordRecoveryComponent } from './password-recovery/password-recovery.component';
import { PrivacyComponent } from './legal/privacy/privacy.component';
import { TermsComponent } from './legal/terms/terms.component';

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
    canActivate: [emailTokenGuard],
  },
  {
    path: 'recover',
    component: PasswordRecoveryComponent,
    canActivate: [emailTokenGuard],
  },
  {
    path: 'privacy',
    component: PrivacyComponent,
  },
  {
    path: 'terms',
    component: TermsComponent,
  },
  { path: '**', redirectTo: '' },
];
