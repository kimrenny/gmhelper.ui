import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import * as AdminState from 'src/app/store/admin/admin.state';
import { select, Store } from '@ngrx/store';
import {
  selectIsLoaded,
  selectRoleStats,
} from 'src/app/store/admin/admin.selectors';
import * as AdminActions from 'src/app/store/admin/admin.actions';

interface RoleStats {
  role: string;
  count: number;
}

@Component({
  selector: 'app-role-stats',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './role-stats.component.html',
  styleUrls: ['./role-stats.component.scss'],
})
export class RoleStatsComponent implements OnInit, OnDestroy {
  roleStats: RoleStats[] = [];
  private subscriptions = new Subscription();

  constructor(private store: Store<AdminState.AdminState>) {}

  ngOnInit(): void {
    this.subscriptions.add(
      combineLatest([
        this.store.pipe(select(selectRoleStats)),
        this.store.pipe(select(selectIsLoaded)),
      ]).subscribe(([stats, isLoaded]) => {
        if (!stats && isLoaded) {
          this.store.dispatch(AdminActions.loadRoleStats());
        } else if (stats) {
          this.roleStats = stats;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
