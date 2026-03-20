import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { AdminService } from 'src/app/services/admin.service';
import { combineLatest, filter, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { TooltipDirective } from 'src/app/shared/directives/tooltip/tooltip.directive';
import { select, Store } from '@ngrx/store';
import * as AuthSelectors from '../../store/auth/auth.selectors';
import * as UserState from 'src/app/store/user/user.state';
import * as AuthState from 'src/app/store/auth/auth.state';
import * as AdminActions from 'src/app/store/admin/admin.actions';
import {
  selectIsLoaded,
  selectNotFoundReports,
  selectNotFoundReportsCount,
} from 'src/app/store/admin/admin.selectors';
import { NotFoundReport } from 'src/app/models/admin.model';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, TooltipDirective],
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.scss'],
})
export class AdminReportsComponent implements OnInit, OnDestroy {
  userRole: string | null = null;

  reports$ = this.store.pipe(select(selectNotFoundReports));
  totalReportsCount: number = 0;

  selectedReport: NotFoundReport | null = null;
  currentPage: number = 1;
  pageInput: number = 1;
  reportsPerPage: number = 10;

  isConfirmModalOpen: boolean = false;
  reportToConfirm: NotFoundReport | null = null;

  isAccessDeniedModalOpen: boolean = false;

  sortColumn: keyof NotFoundReport | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  showData: boolean = true;

  private subscriptions = new Subscription();

  constructor(
    private adminService: AdminService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private store: Store<UserState.UserState>,
    private authStore: Store<AuthState.AuthState>
  ) {}

  ngOnInit(): void {
    const roleSub = this.authStore
      .select(AuthSelectors.selectUserRole)
      .subscribe((role) => {
        this.userRole = role;
      });

    this.subscriptions.add(
      combineLatest([
        this.store.pipe(select(selectNotFoundReports)),
        this.store.pipe(select(selectIsLoaded)),
      ]).subscribe(([reports, isLoaded]) => {
        if ((!reports || reports.length === 0) && isLoaded) {
          this.loadReportsFromStore();
        }
      })
    );

    this.subscriptions.add(
      this.store
        .pipe(select(selectNotFoundReportsCount))
        .subscribe(
          (count: number | null) => (this.totalReportsCount = count ?? 0)
        )
    );

    this.subscriptions.add(roleSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadReportsFromStore() {
    this.store.dispatch(
      AdminActions.loadNotFoundReports({
        page: this.currentPage,
        pageSize: this.reportsPerPage,
        sortColumn: this.sortColumn ?? 'clientTimestamp',
        sortDirection: this.sortDirection
      })
    );
  }

  get totalPages(): number {
    return Math.ceil(this.totalReportsCount / this.reportsPerPage);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageInput = this.currentPage;
      this.loadReportsFromStore();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.pageInput = this.currentPage;
      this.loadReportsFromStore();
    }
  }

  goToPage(page: number) {
    if (page < 1) {
      this.currentPage = 1;
    } else if (page > this.totalPages) {
      this.currentPage = this.totalPages;
    } else {
      this.currentPage = page;
    }
    this.pageInput = this.currentPage;
    this.loadReportsFromStore();
  }

  openConfirmModal(report: NotFoundReport) {
    this.reportToConfirm = report;
    this.isConfirmModalOpen = true;
  }

  closeConfirmModal() {
    this.isConfirmModalOpen = false;
    this.reportToConfirm = null;
  }

  confirmAction() {
    if (this.reportToConfirm) {
      this.toggleReportStatus(this.reportToConfirm);
      this.closeConfirmModal();
    }
  }

  toggleReportStatus(report: NotFoundReport) {
    this.adminService
      .actionReport(report.id, report.isResolved ? 'unresolved' : 'resolved')
      .subscribe({
        next: () => {
          this.loadReportsFromStore();
          this.toastr.success(
            this.translate.instant('ADMIN.SUCCESS.MESSAGE'),
            this.translate.instant('ADMIN.SUCCESS.TITLE')
          );
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  openReportDetails(report: NotFoundReport) {
    this.selectedReport = report;
  }

  closeReportDetails() {
    this.selectedReport = null;
  }

  sortByColumn(column: keyof NotFoundReport): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.loadReportsFromStore();
  }
}
