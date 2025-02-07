import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenService } from 'src/app/services/token.service';
import { Subscription } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';

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
  imports: [CommonModule, TranslateModule],
  templateUrl: './admin-tokens.component.html',
  styleUrls: ['./admin-tokens.component.scss'],
})
export class AdminTokensComponent implements OnInit, OnDestroy {
  currentToken!: string | null;
  userRole!: string | null;

  tokens: Token[] = [];

  selectedToken: Token | null = null;
  currentPage: number = 1;
  tokensPerPage: number = 10;

  isConfirmModalOpen: boolean = false;
  tokenToConfirm: Token | null = null;

  isAccessDeniedModalOpen: boolean = false;

  private subscriptions = new Subscription();

  constructor(
    private adminService: AdminService,
    private tokenService: TokenService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.currentToken = this.tokenService.getTokenFromStorage('authToken');

    const roleSub = this.tokenService.userRole$.subscribe((role) => {
      this.userRole = role;
      if (this.userRole === 'Admin' || this.userRole === 'Owner') {
        this.adminService.getAllTokens();

        this.adminService.getTokens().subscribe((tokens) => {
          if (tokens) {
            this.tokens = tokens;
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
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  openConfirmModal(token: Token) {
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
      .actionToken(token.token, token.isActive ? 'activate' : 'disable')
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
    this.selectedToken = token;
  }

  closeTokenDetails() {
    this.selectedToken = null;
  }
}
