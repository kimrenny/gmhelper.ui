import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { TokenService } from 'src/app/services/token.service';
import { TranslateModule } from '@ngx-translate/core';
import { select, Store } from '@ngrx/store';
import * as AdminState from 'src/app/store/admin/admin.state';
import * as AdminActions from 'src/app/store/admin/admin.actions';
import { BlockStats } from 'src/app/models/admin.model';
import {
  selectBlockStats,
  selectIsLoaded,
} from 'src/app/store/admin/admin.selectors';

@Component({
  selector: 'app-block-stats',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './block-stats.component.html',
  styleUrls: ['./block-stats.component.scss'],
})
export class BlockStatsComponent implements OnInit, OnDestroy {
  blockStats: BlockStats[] = [];
  private subscriptions = new Subscription();

  constructor(private store: Store<AdminState.AdminState>) {}

  ngOnInit(): void {
    this.subscriptions.add(
      combineLatest([
        this.store.pipe(select(selectBlockStats)),
        this.store.pipe(select(selectIsLoaded)),
      ]).subscribe(([stats, isLoaded]) => {
        if (!stats && isLoaded) {
          this.store.dispatch(AdminActions.loadBlockStats());
        } else if (stats) {
          this.blockStats = stats;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
