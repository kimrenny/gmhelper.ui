import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { TokenService } from 'src/app/services/token.service';
import { TranslateModule } from '@ngx-translate/core';

interface CountryStats {
  country: string;
  count: number;
}

@Component({
  selector: 'app-country-stats',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './country-stats.component.html',
  styleUrls: ['./country-stats.component.scss'],
})
export class CountryStatsComponent implements OnInit, OnDestroy {
  countryStats: CountryStats[] = [];
  private userRole: string | null = null;
  private subscriptions = new Subscription();

  constructor(
    private adminService: AdminService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    const roleSub = this.tokenService.userRole$.subscribe((role) => {
      this.userRole = role;
      if (this.userRole === 'Admin' || this.userRole === 'Owner') {
        this.adminService.getCountryUsersDataObservable().subscribe((stats) => {
          if (stats) {
            this.processCountryStats(stats);
          }
        });
      }
    });

    this.subscriptions.add(roleSub);
  }

  processCountryStats(stats: CountryStats[]): void {
    if (!Array.isArray(stats)) {
      this.countryStats = [];
      return;
    }

    const sortedStats = stats
      .map((s) => ({
        country: s.country === 'Unknown' ? 'OTHER' : s.country,
        count: s.count,
      }))
      .sort((a, b) => b.count - a.count);

    const popular = sortedStats.slice(0, 5);
    const otherCount = sortedStats
      .slice(5)
      .reduce((sum, item) => sum + item.count, 0);

    if (otherCount > 0) {
      popular.push({ country: 'OTHER', count: otherCount });
    }

    this.countryStats = popular;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
