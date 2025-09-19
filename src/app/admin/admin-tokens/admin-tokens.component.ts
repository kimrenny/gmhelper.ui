import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenService } from 'src/app/services/token.service';
import { filter, Subscription } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { AdminSettingsService } from 'src/app/services/admin-settings.service';
import { FormsModule } from '@angular/forms';
import { TooltipDirective } from 'src/app/shared/directives/tooltip/tooltip.directive';
import * as AuthSelectors from '../../store/auth/auth.selectors';
import * as UserState from 'src/app/store/user/user.state';
import * as AuthState from 'src/app/store/auth/auth.state';
import { Store } from '@ngrx/store';

interface DeviceInfo {
  userAgent: string;
  platform: string;
}

interface Token {
  id: string;
  token: string;
  expiration: string;
  refreshTokenExpiration: string;
  userId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  isActive: boolean;
}

@Component({
  selector: 'app-admin-tokens',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, TooltipDirective],
  templateUrl: './admin-tokens.component.html',
  styleUrls: ['./admin-tokens.component.scss'],
})
export class AdminTokensComponent implements OnInit, OnDestroy {
  currentToken!: string | null;

  tokens: Token[] = [];

  selectedToken: Token | null = null;
  currentPage: number = 1;
  pageInput: number = 1;
  tokensPerPage: number = 10;

  isConfirmModalOpen: boolean = false;
  tokenToConfirm: Token | null = null;

  isAccessDeniedModalOpen: boolean = false;

  sortColumn: keyof Token | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  showToken = true;
  showExp = true;
  showUserId = true;
  showModal = true;
  allowActions = true;

  private subscriptions = new Subscription();

  constructor(
    private adminService: AdminService,
    private adminSettingsService: AdminSettingsService,
    private tokenService: TokenService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private store: Store<AuthState.AuthState>
  ) {}

  ngOnInit(): void {
    const tokenSub = this.store
      .select(AuthSelectors.selectAccessToken)
      .subscribe((token) => {
        this.currentToken = token;
      });

    this.adminService.getTokens().subscribe((tokens) => {
      if (tokens) {
        this.tokens = tokens;
        if (!this.sortColumn) {
          this.sortByColumn('expiration');
        }
      }
    });

    const settingsSub = this.adminSettingsService
      .getSettingsData()
      .pipe(filter(Boolean))
      .subscribe((settings) => {
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
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get totalPages(): number {
    return Math.ceil(this.tokens.length / this.tokensPerPage);
  }

  get paginatedTokens() {
    const start = (this.currentPage - 1) * this.tokensPerPage;
    const end = start + this.tokensPerPage;
    return this.tokens.slice(start, end);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageInput = this.currentPage;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.pageInput = this.currentPage;
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
          token.isActive = !token.isActive;
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

    this.tokens.sort((a, b) => {
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
