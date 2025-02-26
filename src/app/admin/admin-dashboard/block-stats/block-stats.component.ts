import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { TokenService } from 'src/app/services/token.service';
import { TranslateModule } from '@ngx-translate/core';

interface BlockStats {
  status: string;
  count: number;
}

@Component({
  selector: 'app-block-stats',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './block-stats.component.html',
  styleUrls: ['./block-stats.component.scss'],
})
export class BlockStatsComponent implements OnInit, OnDestroy {
  blockStats: BlockStats[] = [];
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
        this.adminService.getBlockStatsDataObservable().subscribe((stats) => {
          if (stats) {
            this.blockStats = stats;
          }
        });
      }
    });

    this.subscriptions.add(roleSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
