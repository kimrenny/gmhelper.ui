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
  private userRole!: string | null;

  private subscriptions = new Subscription();

  constructor(private tokenService: TokenService, private router: Router) {}

  ngOnInit(): void {
    const roleSub = this.tokenService.userRole$.subscribe((role) => {
      this.userRole = role;
      if (this.userRole !== 'Owner' && this.userRole !== 'Admin') {
        this.router.navigate([], {
          queryParams: { section: 'welcome' },
          replaceUrl: true,
        });
      }
    });

    this.subscriptions.add(roleSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
