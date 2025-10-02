import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, Subscription } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { TooltipDirective } from 'src/app/shared/directives/tooltip/tooltip.directive';
import * as AuthSelectors from '../../store/auth/auth.selectors';
import * as AuthState from 'src/app/store/auth/auth.state';
import * as AdminState from 'src/app/store/admin/admin.state';
import { select, Store } from '@ngrx/store';
import * as AdminActions from 'src/app/store/admin/admin.actions';
import {
  selectAdminSettings,
  selectIsLoaded,
  selectTokens,
  selectTokensCount,
} from 'src/app/store/admin/admin.selectors';
import { Token } from 'src/app/models/admin.model';

export const TOKEN_VALIDITY_DURATION = 30 * 60 * 1000; // 30 min * 60 sec * 1000 ms

@Component({
  selector: 'app-admin-tokens',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, TooltipDirective],
  templateUrl: './admin-tokens.component.html',
  styleUrls: ['./admin-tokens.component.scss'],
})
export class AdminTokensComponent implements OnInit, OnDestroy {
  currentToken!: string | null;

  tokens$ = this.store.pipe(select(selectTokens));
  totalTokensCount: number = 0;

  selectedToken: Token | null = null;
  currentPage: number = 1;
  pageInput: number = 1;
  tokensPerPage: number = 10;

  isConfirmModalOpen: boolean = false;
  tokenToConfirm: Token | null = null;

  isAccessDeniedModalOpen: boolean = false;

  sortColumn: keyof Token | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  maxExpirationDate: string = new Date(
    Date.now() + TOKEN_VALIDITY_DURATION
  ).toISOString();

  showToken = true;
  showExp = true;
  showUserId = true;
  showModal = true;
  allowActions = true;

  private subscriptions = new Subscription();

  constructor(
    private adminService: AdminService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private store: Store<AdminState.AdminState>,
    private authStore: Store<AuthState.AuthState>
  ) {}

  ngOnInit(): void {
    const tokenSub = this.authStore
      .select(AuthSelectors.selectAccessToken)
      .subscribe((token) => {
        this.currentToken = token;
      });

    this.subscriptions.add(
      combineLatest([
        this.store.pipe(select(selectTokens)),
        this.store.pipe(select(selectIsLoaded)),
      ]).subscribe(([tokens, isLoaded]) => {
        if ((!tokens || tokens.length === 0) && isLoaded) {
          this.loadTokensFromStore();
        }
      })
    );

    this.subscriptions.add(
      this.store
        .pipe(select(selectTokensCount))
        .subscribe(
          (count: number | null) => (this.totalTokensCount = count ?? 0)
        )
    );

    const settingsSub = this.store
      .pipe(select(selectAdminSettings))
      .subscribe((settings) => {
        if (!settings) {
          this.store.dispatch(AdminActions.loadAdminSettings());
          return;
        }

        if (Array.isArray(settings) && settings.length > 0) {
          const switches = settings[2];
          this.showToken = switches[0];
          this.showExp = switches[1];
          this.showUserId = switches[2];
          this.showModal = switches[3];
          this.allowActions = switches[4];
        }
      });

    this.subscriptions.add(settingsSub);
    this.subscriptions.add(tokenSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadTokensFromStore() {
    this.store.dispatch(
      AdminActions.loadTokens({
        page: this.currentPage,
        pageSize: this.tokensPerPage,
        sortColumn: this.sortColumn ?? 'expiration',
        sortDirection: this.sortDirection,
        maxExpirationDate: this.maxExpirationDate,
      })
    );
  }

  get totalPages(): number {
    return Math.ceil(this.totalTokensCount / this.tokensPerPage);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageInput = this.currentPage;
      this.loadTokensFromStore();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.pageInput = this.currentPage;
      this.loadTokensFromStore();
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
    this.loadTokensFromStore();
  }

  openConfirmModal(token: Token) {
    if (!this.allowActions) {
      this.toastr.error(
        this.translate.instant('ADMIN.ERRORS.DISABLED'),
        this.translate.instant('ADMIN.ERRORS.ERROR')
      );
      return;
    }

    if (token.token === this.currentToken) {
      this.toastr.error(
        this.translate.instant('ADMIN.ERRORS.SELFBAN'),
        this.translate.instant('ADMIN.ERRORS.ERROR')
      );
      return;
    }

    this.tokenToConfirm = token;
    this.isConfirmModalOpen = true;
  }

  closeConfirmModal() {
    this.isConfirmModalOpen = false;
    this.tokenToConfirm = null;
  }

  confirmAction() {
    if (this.tokenToConfirm) {
      this.toggleTokenStatus(this.tokenToConfirm);
      this.closeConfirmModal();
    }
  }

  toggleTokenStatus(token: Token) {
    this.adminService
      .actionToken(token.token, !token.isActive ? 'activate' : 'disable')
      .subscribe({
        next: () => {
          this.loadTokensFromStore();
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

  openTokenDetails(token: Token) {
    if (!this.showModal) {
      this.toastr.error(
        this.translate.instant('ADMIN.ERRORS.DISABLED'),
        this.translate.instant('ADMIN.ERRORS.ERROR')
      );
      return;
    }
    this.selectedToken = token;
  }

  closeTokenDetails() {
    this.selectedToken = null;
  }

  sortByColumn(column: keyof Token): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.loadTokensFromStore();
  }
}
