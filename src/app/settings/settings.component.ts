import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [TranslateModule, ReactiveFormsModule, CommonModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  devices: any[] = [];
  showPassword: boolean = false;
  isSettingsActive: boolean = true;
  selectedAvatar: File | null = null;
  menuOpen = false;
  isAuthorized!: boolean;

  userNickname: string = '';
  userAvatarUrl: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.settingsForm = this.fb.group({
      nickname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      currentPassword: [''],
      newPassword: [''],
      confirmNewPassword: [''],
      avatar: [null],
    });

    this.getUserDetails();
    this.getLoggedDevices();
  }

  getUserDetails(attempt = 0) {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get<{ nickname: string; email: string; avatarUrl: string }>(
        'https://localhost:7057/api/user/details',
        { headers }
      )
      .subscribe({
        next: (response) => {
          this.userNickname = response.nickname;
          this.userAvatarUrl = response.avatarUrl;
          this.isAuthorized = true;
          this.settingsForm.patchValue({
            nickname: response.nickname,
            email: response.email,
          });
        },
        error: (err) => {
          console.error('Error fetching user details:', err);
          switch (err.error) {
            case 'User is blocked.':
              this.isAuthorized = false;
              this.userAvatarUrl = 'assets/icons/default-avatar.png';
              localStorage.removeItem('authToken');
              break;
            case 'User not found.':
              this.isAuthorized = false;
              this.userAvatarUrl = 'assets/icons/default-avatar.png';
              localStorage.removeItem('authToken');
              break;
            case 'Invalid data.':
              this.isAuthorized = false;
              this.userAvatarUrl = 'assets/icons/default-avatar.png';
              localStorage.removeItem('authToken');
              break;
            case 'Invalid token.':
              this.isAuthorized = false;
              this.userAvatarUrl = 'assets/icons/default-avatar.png';
              localStorage.removeItem('authToken');
              break;
            default:
              this.isAuthorized = false;
              this.userAvatarUrl = 'assets/icons/default-avatar.png';
              console.error(
                `Unknown error: ${err.error}. Attempt ${++attempt}`
              );
              if (attempt >= 3) {
                break;
              }
              setTimeout(() => this.getUserDetails(attempt), 2500);
              break;
          }
        },
      });
  }

  // Получаем информацию о устройствах
  getLoggedDevices() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get<any[]>('https://localhost:7057/api/user/devices', { headers })
      .subscribe((devices) => {
        this.devices = devices;
      });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  showSettings() {
    this.isSettingsActive = true;
  }

  showDevices() {
    this.isSettingsActive = false;
  }

  onSubmit() {
    if (this.settingsForm.valid) {
      const { nickname, email, currentPassword, newPassword } =
        this.settingsForm.value;
      const token = localStorage.getItem('authToken');
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      const formData = new FormData();
      formData.append('nickname', nickname);
      formData.append('email', email);
      if (currentPassword) {
        formData.append('currentPassword', currentPassword);
      }
      if (newPassword) {
        formData.append('newPassword', newPassword);
      }
      if (this.selectedAvatar) {
        formData.append('avatar', this.selectedAvatar);
      }

      this.http
        .put('https://localhost:7057/api/user/update', formData, { headers })
        .subscribe(
          (response) => {
            console.log('User settings updated successfully.');
          },
          (error) => {
            console.error('Error updating settings: ', error);
          }
        );
    }
  }
}
