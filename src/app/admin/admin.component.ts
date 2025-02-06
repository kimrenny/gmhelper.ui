import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminNavComponent } from './admin-navigation/admin-navigation.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminTokensComponent } from './admin-tokens/admin-tokens.component';
import { AdminLogsComponent } from './admin-logs/admin-logs.component';
import { AdminSettingsComponent } from './admin-settings/admin-settings.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    AdminNavComponent,
    AdminDashboardComponent,
    AdminUsersComponent,
    AdminTokensComponent,
    AdminLogsComponent,
    AdminSettingsComponent,
    TranslateModule,
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {}
