import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { TokenService } from 'src/app/services/token.service';
import { TranslateModule } from '@ngx-translate/core';
import { select, Store } from '@ngrx/store';
import * as AdminState from 'src/app/store/admin/admin.state';
import * as AdminActions from 'src/app/store/admin/admin.actions';
import {
  selectCountryStats,
  selectIsLoaded,
} from 'src/app/store/admin/admin.selectors';

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
  private subscriptions = new Subscription();

  constructor(private store: Store<AdminState.AdminState>) {}

  ngOnInit(): void {
    this.subscriptions.add(
      combineLatest([
        this.store.pipe(select(selectCountryStats)),
        this.store.pipe(select(selectIsLoaded)),
      ]).subscribe(([stats, isLoaded]) => {
        if (!stats && isLoaded) {
          this.store.dispatch(AdminActions.loadCountryStats());
        } else if (stats) {
          this.processCountryStats(stats);
        }
      })
    );
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
