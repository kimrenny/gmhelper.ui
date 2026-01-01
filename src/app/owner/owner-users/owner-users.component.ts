import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { AdminService } from 'src/app/services/admin.service';
import { combineLatest, filter, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { TooltipDirective } from 'src/app/shared/directives/tooltip/tooltip.directive';
import { select, Store } from '@ngrx/store';
import * as UserSelectors from '../../store/user/user.selectors';
import * as AuthSelectors from '../../store/auth/auth.selectors';
import * as UserState from 'src/app/store/user/user.state';
import * as AuthState from 'src/app/store/auth/auth.state';
import * as OwnerActions from 'src/app/store/owner/owner.actions';
import {
  selectIsLoaded,
  selectUsers,
  selectUsersCount,
} from 'src/app/store/owner/owner.selectors';
import { LoginToken } from 'src/app/models/admin.model';

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
  selector: 'app-owner-users',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, TooltipDirective],
  templateUrl: './owner-users.component.html',
  styleUrls: ['./owner-users.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      transition(':enter, :leave', [animate('300ms ease-in-out')]),
    ]),
  ],
})
export class OwnerUsersComponent implements OnInit, OnDestroy {
  currentUsername!: string;
  userRole!: string | null;

  users$ = this.store.pipe(select(selectUsers));
  totalUsersCount: number = 0;

  selectedUser: User | null = null;
  currentPage: number = 1;
  pageInput: number = 1;
  usersPerPage: number = 10;

  isConfirmModalOpen: boolean = false;
  userToConfirm: User | null = null;

  isAccessDeniedModalOpen: boolean = false;

  sortColumn: keyof User | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  maxRegistrationDate: string = new Date().toISOString();

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
        this.store.pipe(select(selectUsers)),
        this.store.pipe(select(selectIsLoaded)),
      ]).subscribe(([users, isLoaded]) => {
        if ((!users || users.length === 0)) {
          this.loadUsersFromStore();
        }
      })
    );

    this.subscriptions.add(
      this.store
        .pipe(select(selectUsersCount))
        .subscribe(
          (count: number | null) => (this.totalUsersCount = count ?? 0)
        )
    );

    const userSub = this.store
      .select(UserSelectors.selectUser)
      .subscribe((userDetails) => {
        this.currentUsername = userDetails.nickname;
      });

    this.subscriptions.add(roleSub);
    this.subscriptions.add(userSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadUsersFromStore() {
    this.store.dispatch(
      OwnerActions.loadUsers({
        page: this.currentPage,
        pageSize: this.usersPerPage,
        sortColumn: this.sortColumn ?? 'registrationDate',
        sortDirection: this.sortDirection,
        maxRegistrationDate: this.maxRegistrationDate,
      })
    );
  }

  get totalPages(): number {
    return Math.ceil(this.totalUsersCount / this.usersPerPage);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageInput = this.currentPage;
      this.loadUsersFromStore();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.pageInput = this.currentPage;
      this.loadUsersFromStore();
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
    this.loadUsersFromStore();
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
      user.role === 'Owner' && this.userRole === 'Owner'
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
          this.loadUsersFromStore();
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

  openUserDetails(user: User) {
    if (user.role === 'Owner' && this.userRole === 'Admin') {
      this.toastr.error(
        this.translate.instant('ADMIN.ERRORS.NOPERMISSION'),
        this.translate.instant('ADMIN.ERRORS.ERROR')
      );
      return;
    }

    this.selectedUser = user;
  }

  closeUserDetails() {
    this.selectedUser = null;
  }

  sortByColumn(column: keyof User): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.loadUsersFromStore();
  }
}
