import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { AdminService } from 'src/app/services/admin.service';
import { Subscription } from 'rxjs';
import { TokenService } from 'src/app/services/token.service';
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

interface DeviceInfo {
  userAgent: string;
  platform: string;
}

interface LoginToken {
  expiration: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  isActive: boolean;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  registrationDate: string;
  isBlocked: boolean;
  loginTokens: LoginToken[];
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      transition(':enter, :leave', [animate('300ms ease-in-out')]),
    ]),
  ],
})
export class AdminUsersComponent implements OnInit, OnDestroy {
  currentUsername!: string;
  userRole!: string | null;

  users: User[] = [];

  selectedUser: User | null = null;
  currentPage: number = 1;
  usersPerPage: number = 10;

  tokenPage: number = 1;
  tokensPerPage: number = 1;

  isConfirmModalOpen: boolean = false;
  userToConfirm: User | null = null;

  isAccessDeniedModalOpen: boolean = false;

  sortColumn: keyof User | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  private subscriptions = new Subscription();

  constructor(
    private adminService: AdminService,
    private tokenService: TokenService,
    private userService: UserService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const roleSub = this.tokenService.userRole$.subscribe((role) => {
      this.userRole = role;
      if (this.userRole === 'Admin' || this.userRole === 'Owner') {
        this.adminService.checkUsersData();

        this.adminService.getUsers().subscribe((users) => {
          if (users) {
            this.users = users;
          }
        });
      }
    });

    const userSub = this.userService.user$.subscribe((userDetails) => {
      this.currentUsername = userDetails.nickname;
    });

    this.subscriptions.add(roleSub);
    this.subscriptions.add(userSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get totalPages(): number {
    return Math.ceil(this.users.length / this.usersPerPage);
  }

  get paginatedUsers() {
    const start = (this.currentPage - 1) * this.usersPerPage;
    const end = start + this.usersPerPage;
    return this.users.slice(start, end);
  }

  get totalTokenPages(): number {
    if (this.selectedUser?.loginTokens) {
      return Math.ceil(
        this.selectedUser.loginTokens.length / this.tokensPerPage
      );
    }
    return 1;
  }

  get paginatedTokens() {
    if (this.selectedUser?.loginTokens) {
      const start = (this.tokenPage - 1) * this.tokensPerPage;
      const end = start + this.tokensPerPage;
      return this.selectedUser.loginTokens.slice(start, end);
    }
    return [];
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

  prevTokenPage() {
    if (this.tokenPage > 1) {
      this.tokenPage--;
    }
  }

  nextTokenPage() {
    if (this.tokenPage < this.totalTokenPages) {
      this.tokenPage++;
    }
  }

  openConfirmModal(user: User) {
    if (user.username === this.currentUsername) {
      this.toastr.error(
        this.translate.instant('ADMIN.ERRORS.SELFBAN'),
        this.translate.instant('ADMIN.ERRORS.ERROR')
      );
      return;
    }

    if (
      ((user.role === 'Owner' || user.role === 'Admin') &&
        this.userRole === 'Admin') ||
      (user.role === 'Owner' && this.userRole === 'Owner')
    ) {
      this.toastr.error(
        this.translate.instant('ADMIN.ERRORS.NOPERMISSION'),
        this.translate.instant('ADMIN.ERRORS.ERROR')
      );
      return;
    }

    this.userToConfirm = user;
    this.isConfirmModalOpen = true;
  }

  closeConfirmModal() {
    this.isConfirmModalOpen = false;
    this.userToConfirm = null;
  }

  confirmAction() {
    if (this.userToConfirm) {
      this.toggleUserStatus(this.userToConfirm);
      this.closeConfirmModal();
    }
  }

  toggleUserStatus(user: User) {
    this.adminService
      .actionUser(user.id, user.isBlocked ? 'unban' : 'ban')
      .subscribe({
        next: () => {
          user.isBlocked = !user.isBlocked;
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  openUserDetails(user: User) {
    if (user.role === 'Owner' && this.userRole === 'Admin') {
      this.toastr.error(
        this.translate.instant('ADMIN.ERRORS.NOPERMISSION'),
        this.translate.instant('ADMIN.ERRORS.ERROR')
      );
      return;
    }

    this.selectedUser = user;
    this.tokenPage = 1;
  }

  closeUserDetails() {
    this.selectedUser = null;
    this.tokenPage = 1;
  }

  sortByColumn(column: keyof User): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.users.sort((a, b) => {
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
