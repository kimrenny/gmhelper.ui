import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { TokenService } from 'src/app/services/token.service';
import { TranslateModule } from '@ngx-translate/core';

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

  constructor(
    private adminService: AdminService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.adminService.getActiveTokensObservable().subscribe((tokens) => {
      if (tokens) {
        this.activeTokens = tokens;
      }
    });

    this.adminService.getTotalTokensObservable().subscribe((tokens) => {
      if (tokens) {
        this.totalTokens = tokens;
      }
    });

    this.adminService.getActiveAdminTokensObservable().subscribe((tokens) => {
      if (tokens) {
        this.activeAdminTokens = tokens;
      }
    });

    this.adminService.getTotalAdminTokensObservable().subscribe((tokens) => {
      if (tokens) {
        this.totalAdminTokens = tokens;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
