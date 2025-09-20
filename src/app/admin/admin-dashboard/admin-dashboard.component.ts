import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationChartComponent } from './registration-chart/registration-chart.component';
import { ActiveUsersComponent } from './active-users/active-users.component';
import { RequestsChartComponent } from './requests-chart/requests-chart.component';
import { CountryStatsComponent } from './country-stats/country-stats.component';
import { RoleStatsComponent } from './role-stats/role-stats.component';
import { BlockStatsComponent } from './block-stats/block-stats.component';
import { filter, Subscription } from 'rxjs';
import * as AdminState from 'src/app/store/admin/admin.state';
import { select, Store } from '@ngrx/store';
import { selectAdminSettings } from 'src/app/store/admin/admin.selectors';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RegistrationChartComponent,
    ActiveUsersComponent,
    RequestsChartComponent,
    CountryStatsComponent,
    RoleStatsComponent,
    BlockStatsComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  showRequests = true;
  showActiveUsers = true;
  showBlockStats = true;
  showRoleStats = true;
  showCountryStats = true;

  private subscriptions = new Subscription();

  constructor(private store: Store<AdminState.AdminState>) {}

  ngOnInit(): void {
    const settingsSub = this.store
      .select(selectAdminSettings)
      .subscribe((settings) => {
        if (Array.isArray(settings) && settings.length > 0) {
          const switches = settings[0];
          this.showRequests = switches[0];
          this.showActiveUsers = switches[1];
          this.showBlockStats = switches[2];
          this.showRoleStats = switches[3];
          this.showCountryStats = switches[4];
        }
      });

    this.subscriptions.add(settingsSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
