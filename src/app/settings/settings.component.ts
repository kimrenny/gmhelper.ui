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
  isSettingsActive: boolean = true; // Управление активной вкладкой
  selectedAvatar: File | null = null;
  menuOpen = false;

  // Переменные для хранения данных пользователя
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

    // Получаем информацию о пользователе
    this.getUserDetails();
    this.getLoggedDevices();
  }

  // Функция для получения данных пользователя
  getUserDetails() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get<{ nickname: string; email: string; avatarUrl: string }>(
        'https://localhost:7057/api/user/details',
        { headers }
      )
      .subscribe((response) => {
        this.userNickname = response.nickname; // Записываем никнейм пользователя
        this.userAvatarUrl = response.avatarUrl; // Записываем URL аватара
        this.settingsForm.patchValue({
          nickname: response.nickname,
          email: response.email,
        });
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
