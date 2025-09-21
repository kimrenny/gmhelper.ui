import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { select, Store } from '@ngrx/store';
import * as AdminState from 'src/app/store/admin/admin.state';
import {
  selectIsLoaded,
  selectTokenStats,
} from 'src/app/store/admin/admin.selectors';
import * as AdminActions from 'src/app/store/admin/admin.actions';

@Component({
  selector: 'app-active-users',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './active-users.component.html',
  styleUrls: ['./active-users.component.scss'],
})
export class ActiveUsersComponent implements OnInit, OnDestroy {
  activeTokens: number | any;
  totalTokens: number | any;
  activeAdminTokens: number | any;
  totalAdminTokens: number | any;
  private subscriptions = new Subscription();

  constructor(private store: Store<AdminState.AdminState>) {}

  ngOnInit(): void {
    this.subscriptions.add(
      combineLatest([
        this.store.pipe(select(selectTokenStats)),
        this.store.pipe(select(selectIsLoaded)),
      ]).subscribe(([tokenStats, isLoaded]) => {
        if (
          (!tokenStats.activeTokens ||
            !tokenStats.totalTokens ||
            !tokenStats.activeAdminTokens ||
            !tokenStats.totalAdminTokens) &&
          isLoaded
        ) {
          this.store.dispatch(AdminActions.loadTokenStats());
        } else {
          this.activeTokens = tokenStats.activeTokens;
          this.totalTokens = tokenStats.totalTokens;
          this.activeAdminTokens = tokenStats.activeAdminTokens;
          this.totalAdminTokens = tokenStats.totalAdminTokens;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
