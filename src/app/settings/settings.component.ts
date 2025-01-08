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
  userAvatarUpload: string = '';

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
      .get<{ nickname: string; email: string; avatar: string }>(
        'https://localhost:7057/api/user/details',
        { headers }
      )
      .subscribe({
        next: (response) => {
          console.log(response);
          this.userNickname = response.nickname;
          if (response.avatar) {
            this.userAvatarUrl = `data:image/jpeg;base64,${response.avatar}`;
          } else {
            this.userAvatarUrl = 'assets/icons/default-avatar.png';
          }

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

  getLoggedDevices() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get<any[]>('https://localhost:7057/api/user/devices', { headers })
      .subscribe({
        next: (devices) => {
          if (Array.isArray(devices) && devices.length > 0) {
            console.log(devices);
            this.devices = devices;
          } else {
            console.log('No devices found or invalid data structure.');
          }
        },
        error: (err) => {
          console.error('Error fetching devices:', err);
        },
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

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (file.size > 1024 * 1024) {
        console.error('Avatar size exceeds 1MB.');
        alert('Avatar size must be less than 1MB.');
        return;
      }

      this.selectedAvatar = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.userAvatarUpload = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadAvatar(): void {
    if (!this.selectedAvatar) {
      alert('Please select an avatar to upload.');
      return;
    }

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const formData = new FormData();
    formData.append('avatar', this.selectedAvatar);

    this.http
      .post('https://localhost:7057/api/user/upload-avatar', formData, {
        headers,
      })
      .subscribe({
        next: () => {
          console.log('Avatar uploaded successfully.');
          alert('Avatar uploaded successfully.');
          this.selectedAvatar = null;
          this.getUserDetails();
        },
        error: (err) => {
          console.error('Error uploading avatar:', err);
          alert('Failed to upload avatar.');
        },
      });
  }

  clearAvatar(): void {
    this.selectedAvatar = null;
    this.userAvatarUpload = 'assets/icons/default-avatar.png';
  }

  deactivateDevice(device: any) {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const uniqueDeviceId = `${device.ipAddress}-${device.authorizationDate}`;

    this.http
      .patch(
        `https://localhost:7057/api/user/devices/deactivate`,
        { uniqueDeviceId },
        { headers }
      )
      .subscribe({
        next: () => {
          console.log('Device deactivated successfully.');
          const targetDevice = this.devices.find(
            (d) =>
              d.ipAddress === device.ipAddress &&
              d.authorizationDate === device.authorizationDate
          );
          if (targetDevice) {
            targetDevice.isActive = false;
          }
        },
        error: (err) => {
          console.error('Error deactivating device:', err);
        },
      });
  }
}
