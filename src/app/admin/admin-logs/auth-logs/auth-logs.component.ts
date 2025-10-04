import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, filter, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { TruncatePipe } from 'src/app/pipes/truncate.pipe';
import { FormsModule } from '@angular/forms';
import { TooltipDirective } from 'src/app/shared/directives/tooltip/tooltip.directive';
import { select, Store } from '@ngrx/store';
import * as AdminState from 'src/app/store/admin/admin.state';
import * as AdminActions from 'src/app/store/admin/admin.actions';
import {
  selectAdminSettings,
  selectAuthLogs,
  selectAuthLogsCount,
  selectIsLoaded,
} from 'src/app/store/admin/admin.selectors';
import { AuthLog } from 'src/app/models/admin.model';

@Component({
  selector: 'app-admin-auth-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    TruncatePipe,
    TooltipDirective,
  ],
  templateUrl: './auth-logs.component.html',
  styleUrls: ['./auth-logs.component.scss'],
})
export class AdminAuthLogsComponent implements OnInit, OnDestroy {
  logs$ = this.store.pipe(select(selectAuthLogs));
  totalLogsCount: number = 0;

  selectedLog: AuthLog | null = null;
  currentPage: number = 1;
  pageInput: number = 1;
  logsPerPage: number = 30;

  isConfirmModalOpen: boolean = false;
  logToConfirm: AuthLog | null = null;

  isAccessDeniedModalOpen: boolean = false;

  sortColumn: keyof AuthLog | null = 'id';
  sortDirection: 'asc' | 'desc' = 'desc';

  maxLogDate: string = new Date().toISOString();

  showTimestamp = true;
  showDuration = true;
  showRequest = true;
  showUserId = true;
  showModal = true;

  private subscriptions = new Subscription();

  constructor(
    private store: Store<AdminState.AdminState>,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      combineLatest([
        this.store.pipe(select(selectAuthLogs)),
        this.store.pipe(select(selectIsLoaded)),
      ]).subscribe(([logs, isLoaded]) => {
        if ((!logs || logs.length === 0) && isLoaded) {
          this.loadLogsFromStore();
        }
      })
    );

    this.subscriptions.add(
      this.store
        .pipe(select(selectAuthLogsCount))
        .subscribe((count: number | null) => (this.totalLogsCount = count ?? 0))
    );

    const settingsSub = this.store
      .select(selectAdminSettings)
      .pipe(filter(Boolean))
      .subscribe((settings) => {
        if (Array.isArray(settings) && settings.length > 0) {
          const switches = settings[3];
          this.showTimestamp = switches[0];
          this.showDuration = switches[1];
          this.showRequest = switches[2];
          this.showUserId = switches[3];
          this.showModal = switches[4];
        }
      });

    this.subscriptions.add(settingsSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadLogsFromStore() {
    this.store.dispatch(
      AdminActions.loadAuthLogs({
        page: this.currentPage,
        pageSize: this.logsPerPage,
        sortColumn: this.sortColumn ?? 'id',
        sortDirection: this.sortDirection,
        maxLogDate: this.maxLogDate,
      })
    );
  }

  get totalPages(): number {
    return Math.ceil(this.totalLogsCount / this.logsPerPage);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageInput = this.currentPage;
      this.loadLogsFromStore();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.pageInput = this.currentPage;
      this.loadLogsFromStore();
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
    this.loadLogsFromStore();
  }

  openLogDetails(log: AuthLog) {
    if (!this.showModal) {
      this.toastr.error(
        this.translate.instant('ADMIN.ERRORS.DISABLED'),
        this.translate.instant('ADMIN.ERRORS.ERROR')
      );
      return;
    }
    this.selectedLog = log;
  }

  closeLogDetails() {
    this.selectedLog = null;
  }

  sortByColumn(column: keyof AuthLog): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.loadLogsFromStore();
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
