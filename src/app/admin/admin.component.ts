import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminNavComponent } from './admin-navigation/admin-navigation.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminTokensComponent } from './admin-tokens/admin-tokens.component';
import { AdminLogsComponent } from './admin-logs/admin-logs.component';
import { AdminSettingsComponent } from './admin-settings/admin-settings.component';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TokenService } from '../services/token.service';
import { Router } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { AdminSettingsService } from '../services/admin-settings.service';

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
export class AdminComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();

  constructor(
    private adminService: AdminService,
    private adminSettings: AdminSettingsService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.router.url.startsWith('/admin')) {
      this.adminService.loadAdminData();
      this.adminSettings.loadSettings();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
