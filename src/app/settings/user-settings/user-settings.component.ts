import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
})
export class UserSettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  showPassword = false;
  selectedAvatar: File | null = null;
  userNickname = '';
  userAvatarUrl = '';
  userAvatarUpload = '';

  passwordStrength = 0;
  passwordValidations = {
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasDigit: false,
    hasSpecialChar: false,
    notContainsEmail: true,
  };

  changePasswordError = '';
  changeEmailError = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
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

    this.userService.user$.subscribe((userDetails) => {
      this.userNickname = userDetails.nickname;
      this.userAvatarUrl =
        userDetails.avatar || 'assets/icons/default-avatar.png';

      this.settingsForm.patchValue({
        nickname: this.userNickname,
      });
    });
  }

  getUserDetails(attempt = 0) {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.userService.loadUserDetails(token).subscribe({
        next: (userDetails) => {
          this.userNickname = userDetails.nickname;
          this.userAvatarUrl =
            userDetails.avatar || 'assets/icons/default-avatar.png';
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading user details:', err);
        },
      });
    }
  }

  onSubmit() {
    if (this.settingsForm.valid) {
      const {
        nickname,
        email,
        currentPassword,
        newPassword,
        confirmNewPassword,
      } = this.settingsForm.value;

      if (!nickname && !email && !newPassword) {
        alert('Enter at least one field for update.');
        return;
      }

      if (!this.validateEmail(email)) return;

      if (newPassword) {
        if (!currentPassword) {
          alert('For changing password enter current password');
          return;
        }

        if (newPassword !== confirmNewPassword) {
          alert("New password and confirm doesn't match");
          return;
        }
      }

      if (!this.validatePassword(newPassword, email, nickname)) return;

      const formData = new FormData();
      if (nickname) formData.append('nickname', nickname);
      if (email) formData.append('email', email);
      if (currentPassword) formData.append('currentPassword', currentPassword);
      if (newPassword) formData.append('newPassword', newPassword);

      this.userService.updateUserData(formData).subscribe({
        next: () => {
          this.getUserDetails();
          this.toastr.success(
            this.translate.instant('SETTINGS.SUCCESS.MESSAGE'),
            this.translate.instant('SETTINGS.SUCCESS.TITLE')
          );
        },
        error: (err) => {
          console.error('Error updating data:', err);
          this.toastr.error(
            this.translate.instant('SETTINGS.ERROR.MESSAGE'),
            this.translate.instant('SETTINGS.ERROR.TITLE')
          );
        },
      });
    } else {
      alert('Form has filled incorrectly.');
    }
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (file.size > 1024 * 1024) {
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

    this.userService.uploadAvatar(this.selectedAvatar).subscribe({
      next: () => {
        this.selectedAvatar = null;
        this.getUserDetails();
        this.toastr.success(
          this.translate.instant('SETTINGS.SUCCESS.MESSAGE'),
          this.translate.instant('SETTINGS.SUCCESS.TITLE')
        );
      },
      error: (err) => {
        console.error('Error uploading avatar:', err);
        this.toastr.error(
          this.translate.instant('SETTINGS.ERROR.MESSAGE'),
          this.translate.instant('SETTINGS.ERROR.TITLE')
        );
      },
    });
  }

  clearAvatar(): void {
    this.selectedAvatar = null;
    this.userAvatarUpload = 'assets/icons/default-avatar.png';
  }

  validateEmail(email: string): boolean {
    const emailPattern = /^[a-zA-z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!email) {
      this.changeEmailError = 'REGISTER.ERRORS.EMAIL.REQUIRED';
      return false;
    } else if (!emailPattern.test(email)) {
      this.changeEmailError = 'REGISTER.ERRORS.EMAIL.INVALID';
      return false;
    } else {
      this.changeEmailError = '';
      return true;
    }
  }

  validatePassword(password: string, email: string, nickname: string): boolean {
    if (!password) {
      this.changePasswordError = '';
      return true;
    }

    this.passwordStrength = this.calculatePasswordStrength(
      password,
      email,
      nickname
    );
    if (this.passwordStrength < 3) {
      this.changePasswordError = 'REGISTER.ERRORS.PASSWORD.TOO_WEAK';
      this.cdr.detectChanges();
      return false;
    } else if (this.passwordStrength < 5) {
      this.changePasswordError = 'REGISTER.ERRORS.PASSWORD.WEAK';
      this.cdr.detectChanges();
      return false;
    } else {
      this.changePasswordError = '';
      this.cdr.detectChanges();
      return true;
    }
  }

  calculatePasswordStrength(
    password: string,
    email: string,
    nickname: string
  ): number {
    let strength = 0;

    this.passwordValidations.hasMinLength = password.length >= 8;
    this.passwordValidations.hasUpperCase = /[A-Z]/.test(password);
    this.passwordValidations.hasLowerCase = /[a-z]/.test(password);
    this.passwordValidations.hasDigit = /[0-9]/.test(password);
    this.passwordValidations.hasSpecialChar = /[^a-zA-Z0-9]/.test(password);

    const emailPart = email.split('@')[0].toLowerCase();
    const fullEmail = email.toLowerCase();
    const username = nickname.toLowerCase();

    if (
      (password.toLowerCase().includes(emailPart) && emailPart.length > 0) ||
      (password.toLowerCase().includes(fullEmail) && fullEmail.length > 0) ||
      (password.toLowerCase().includes(username) && username.length > 0)
    ) {
      this.passwordValidations.notContainsEmail = false;
      return 1;
    } else {
      this.passwordValidations.notContainsEmail = true;
    }

    if (this.passwordValidations.hasMinLength) strength++;
    if (this.passwordValidations.hasUpperCase) strength++;
    if (this.passwordValidations.hasLowerCase) strength++;
    if (this.passwordValidations.hasDigit) strength++;
    if (this.passwordValidations.hasSpecialChar) strength++;

    return Math.min(strength, 5);
  }
}
