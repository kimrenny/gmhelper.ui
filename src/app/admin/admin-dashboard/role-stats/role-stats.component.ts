import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { TokenService } from 'src/app/services/token.service';
import { TranslateModule } from '@ngx-translate/core';

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

  constructor(
    private adminService: AdminService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.adminService.getRoleStatsDataObservable().subscribe((stats) => {
      if (stats) {
        this.roleStats = stats;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
