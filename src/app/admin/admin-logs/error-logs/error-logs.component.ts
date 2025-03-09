import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenService } from 'src/app/services/token.service';
import { Subscription } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';

interface ErrorLog {
  id: number;
  timestamp: string;
  message: string;
  stackTrace: string;
  endpoint: string;
  exceptionDetails: string;
}

@Component({
  selector: 'app-admin-error-logs',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './error-logs.component.html',
  styleUrls: ['./error-logs.component.scss'],
})
export class AdminErrorLogsComponent implements OnInit, OnDestroy {
  userRole!: string | null;

  logs: ErrorLog[] = [];

  selectedLog: ErrorLog | null = null;
  currentPage: number = 1;
  logsPerPage: number = 30;

  isConfirmModalOpen: boolean = false;
  logToConfirm: ErrorLog | null = null;

  sortColumn: keyof ErrorLog | null = null;
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
        this.adminService.checkErrorLogData();

        this.adminService.getErrorLogDataObservable().subscribe((logs) => {
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

  sortByColumn(column: keyof ErrorLog): void {
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
}
