import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OwnerNavComponent } from './owner-navigation/owner-navigation.component';
import { OwnerUsersComponent } from './owner-users/owner-users.component';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as OwnerState from '../store/owner/owner.state';
import * as OwnerActions from '../store/owner/owner.actions';

@Component({
  selector: 'app-owner',
  standalone: true,
  imports: [
    CommonModule,
    OwnerNavComponent,
    OwnerUsersComponent,
    TranslateModule,
  ],
  templateUrl: './owner.component.html',
  styleUrls: ['./owner.component.scss'],
})
export class OwnerComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();

  constructor(
    private store: Store<OwnerState.OwnerState>,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.router.url.startsWith('/super')) {
      this.store.dispatch(OwnerActions.loadOwnerData());
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
