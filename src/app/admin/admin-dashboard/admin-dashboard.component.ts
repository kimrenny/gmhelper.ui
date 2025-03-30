import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationChartComponent } from './registration-chart/registration-chart.component';
import { ActiveUsersComponent } from './active-users/active-users.component';
import { RequestsChartComponent } from './requests-chart/requests-chart.component';
import { CountryStatsComponent } from './country-stats/country-stats.component';
import { RoleStatsComponent } from './role-stats/role-stats.component';
import { BlockStatsComponent } from './block-stats/block-stats.component';
import { filter, Subscription } from 'rxjs';
import { AdminSettingsService } from 'src/app/services/admin-settings.service';

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

  private settingsSub!: Subscription;

  constructor(private adminSettingsService: AdminSettingsService) {}

  ngOnInit(): void {
    this.adminSettingsService.getSettings(false);

    this.settingsSub = this.adminSettingsService
      .getSettingsData()
      .pipe(filter(Boolean))
      .subscribe((settings) => {
        console.log(settings);
        if (Array.isArray(settings) && settings.length > 0) {
          const switches = settings[0];
          this.showRequests = switches[0];
          this.showActiveUsers = switches[1];
          this.showBlockStats = switches[2];
          this.showRoleStats = switches[3];
          this.showCountryStats = switches[4];
        }
      });
  }

  ngOnDestroy(): void {
    if (this.settingsSub) {
      this.settingsSub.unsubscribe();
    }
  }
}
