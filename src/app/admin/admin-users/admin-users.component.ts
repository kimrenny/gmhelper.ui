import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AdminService } from 'src/app/services/admin.service';

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
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];

  selectedUser: User | null = null;
  currentPage: number = 1;
  usersPerPage: number = 10;

  tokenPage: number = 1;
  tokensPerPage: number = 1;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getAllUsers();

    this.adminService.getUsers().subscribe((users) => {
      if (users) {
        this.users = users;
      }
    });
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

  toggleUserStatus(user: User) {
    user.isBlocked = !user.isBlocked;
  }

  openUserDetails(user: User) {
    this.selectedUser = user;
    this.tokenPage = 1;
  }

  closeUserDetails() {
    this.selectedUser = null;
    this.tokenPage = 1;
  }
}
