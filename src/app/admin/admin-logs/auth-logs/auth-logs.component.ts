import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenService } from 'src/app/services/token.service';
import { Subscription } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';

interface AuthLog {
  id: number;
  timestamp: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  status: string;
  message: string;
}

@Component({
  selector: 'app-admin-auth-logs',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './auth-logs.component.html',
  styleUrls: ['./auth-logs.component.scss'],
})
export class AdminAuthLogsComponent implements OnInit, OnDestroy {
  userRole!: string | null;

  logs: AuthLog[] = [];

  selectedLog: AuthLog | null = null;
  currentPage: number = 1;
  logsPerPage: number = 30;

  isConfirmModalOpen: boolean = false;
  logToConfirm: AuthLog | null = null;

  isAccessDeniedModalOpen: boolean = false;

  sortColumn: keyof AuthLog | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  private subscriptions = new Subscription();

  constructor(
    private adminService: AdminService,
    private tokenService: TokenService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const roleSub = this.tokenService.userRole$.subscribe((role) => {
      this.userRole = role;
      if (this.userRole === 'Admin' || this.userRole === 'Owner') {
        this.adminService.checkAuthLogData();

        this.adminService.getAuthLogDataObservable().subscribe((logs) => {
          if (logs) {
            this.logs = logs;
          }
        });
      }
    });

    this.subscriptions.add(roleSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get totalPages(): number {
    return Math.ceil(this.logs.length / this.logsPerPage);
  }

  get paginatedLogs() {
    const start = (this.currentPage - 1) * this.logsPerPage;
    const end = start + this.logsPerPage;
    return this.logs.slice(start, end);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  sortByColumn(column: keyof AuthLog): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.logs.sort((a, b) => {
      let valueA = a[column];
      let valueB = b[column];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getFormattedPath(path?: string): string {
    if (!path) return '/';

    const parts = path.split('/');
    const lastPart = parts.pop() || '';

    const formattedPath =
      lastPart.length < 5 ? `/${parts.pop()}/${lastPart}` : `/${lastPart}`;

    return formattedPath.length > 7
      ? formattedPath.slice(0, 7) + '...'
      : formattedPath;
  }
}
