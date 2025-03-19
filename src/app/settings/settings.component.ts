import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [TranslateModule, ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  @ViewChild('dropdown') dropdownRef!: ElementRef;

  settingsForm!: FormGroup;
  devices: any[] = [];
  devicesLoaded: boolean = false;
  showPassword: boolean = false;
  selectedSection: 'user' | 'settings' | 'devices' = 'user';
  selectedAvatar: File | null = null;
  menuOpen = false;
  userNickname: string = '';
  userAvatarUrl: string = '';
  userAvatarUpload: string = '';
  selectedLanguage: string = 'en';
  selectedLanguageName: string = 'English';
  languages = [
    { code: 'de', name: 'Deutsch' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'ru', name: 'Русский' },
    { code: 'ua', name: 'Українська' },
    { code: 'zh', name: '中文' },
  ];

  isDropdownOpen: boolean = false;

  isAuthorized!: Observable<boolean>;
  isServerAvailable!: Observable<boolean>;

  passwordStrength: number = 0;
  passwordValidations = {
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasDigit: false,
    hasSpecialChar: false,
    notContainsEmail: true,
  };

  changePasswordError: string = '';
  changeEmailError: string = '';

  constructor(
    @Inject(UserService) private userService: UserService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.isAuthorized = this.userService.isAuthorized$;
    this.isServerAvailable = this.userService.isServerAvailable$;
  }

  ngOnInit(): void {
    this.settingsForm = this.fb.group({
      nickname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      currentPassword: [''],
      newPassword: [''],
      confirmNewPassword: [''],
      avatar: [null],
    });

    this.userService.checkAuthentication();

    this.userService.user$.subscribe((userDetails) => {
      this.userNickname = userDetails.nickname;
      this.userAvatarUrl =
        userDetails.avatar || 'assets/icons/default-avatar.png';

      this.settingsForm.patchValue({
        nickname: this.userNickname,
      });
    });

    this.userService.isAuthorized$.subscribe((authorized) => {
      if (authorized && !this.devicesLoaded) {
        this.getLoggedDevices();
        this.devicesLoaded = true;
      } else {
      }
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

  getLoggedDevices() {
    this.userService.getLoggedDevices().subscribe({
      next: (devices) => {
        if (Array.isArray(devices) && devices.length > 0) {
          this.devices = devices;
        }
      },
      error: (err) => {
        console.error('Error fetching devices:', err);
      },
    });
  }

  selectLanguage(lang: { code: string; name: string }) {
    this.selectedLanguage = lang.code;
    this.selectedLanguageName = lang.name;
    this.isDropdownOpen = false;
  }

  saveLanguage() {
    console.log('Selected language:', this.selectedLanguage);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  showUserSettings() {
    this.selectedSection = 'user';
  }

  showSettings() {
    this.selectedSection = 'settings';
  }

  showDevices() {
    this.selectedSection = 'devices';
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

      if (!this.validateEmail(email)) {
        console.error('Error during validate email.');
        return;
      }

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

      if (!this.validatePassword(newPassword, email, nickname)) {
        console.error('Error during validate password.');
        return;
      }

      const formData = new FormData();

      if (nickname) {
        formData.append('nickname', nickname);
      }

      if (email) {
        formData.append('email', email);
      }

      if (currentPassword) {
        formData.append('currentPassword', currentPassword);
      }

      if (newPassword) {
        formData.append('newPassword', newPassword);
      }

      this.userService.updateUserData(formData).subscribe({
        next: () => {
          this.getUserDetails();
          //this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error updating data:', err);
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

    this.userService.uploadAvatar(this.selectedAvatar).subscribe({
      next: () => {
        this.selectedAvatar = null;
        this.getUserDetails();
      },
      error: (err) => {
        console.error('Error uploading avatar:', err);
      },
    });
  }

  clearAvatar(): void {
    this.selectedAvatar = null;
    this.userAvatarUpload = 'assets/icons/default-avatar.png';
  }

  async deactivateDevice(device: any) {
    this.userService.deactivateDevice(device).subscribe({
      next: () => {
        this.userService.checkAuthentication(() => {
          this.getLoggedDevices();
        });
      },
      error: (err) => {
        switch (err.error) {
          case 'The current device cannot be deactivated.': {
            this.toastr.error(
              this.translate.instant('SETTINGS.DEVICES.ERROR.CURRENT_DEVICE'),
              this.translate.instant('SETTINGS.DEVICES.ERROR.TITLE')
            );
            break;
          }
          default: {
            this.toastr.error(
              this.translate.instant('SETTINGS.DEVICES.ERROR.OTHER'),
              this.translate.instant('SETTINGS.DEVICES.ERROR.TITLE')
            );
          }
        }
        console.error('Error deactivating device:', err);
      },
    });
  }

  validateEmail(email: string): boolean {
    const emailPattern = /^[a-zA-z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const allowedDomains = [
      'gmail.com',
      'yahoo.com',
      'outlook.com',
      'hotmail.com',
      'icloud.com',
      'orange.fr',
      'sfr.fr',
      'laposte.net',
      'free.fr',
      'yahoo.co.jp',
      'docomo.ne.jp',
      'au.com',
      'ezweb.ne.jp',
      'softbank.ne.jp',
      'naver.com',
      'daum.net',
      'hanmail.net',
      'ukr.net',
      'meta.ua',
      'i.ua',
      'email.ua',
      'qq.com',
      '126.com',
      '163.com',
      'sina.com',
      'sohu.com',
      'btinternet.com',
      'virginmedia.com',
      'rogers.com',
      'shaw.ca',
    ];
    if (!email) {
      this.changeEmailError = 'REGISTER.ERRORS.EMAIL.REQUIRED';
      return false;
    } else if (!emailPattern.test(email)) {
      this.changeEmailError = 'REGISTER.ERRORS.EMAIL.INVALID';
      return false;
    } else {
      const domain = email.split('@')[1];
      if (!allowedDomains.includes(domain)) {
        this.changeEmailError = 'REGISTER.ERRORS.EMAIL.NOT_ALLOWED';
        return false;
      } else {
        this.changeEmailError = '';
        return true;
      }
    }
  }

  validatePassword(password: string, email: string, username: string): boolean {
    if (!password) {
      this.changePasswordError = '';
      return true;
    }
    this.passwordStrength = this.calculatePasswordStrength(
      password,
      email,
      username
    );
    if (!password) {
      this.changePasswordError = 'REGISTER.ERRORS.PASSWORD.REQUIRED';
      this.cdr.detectChanges();
      return false;
    } else if (this.passwordStrength < 3) {
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

  // @HostListener('document:click', ['$event'])
  // onDocumentClick(event: MouseEvent): void {
  //   const clickedInside = this.dropdownRef.nativeElement.contains(event.target);
  //   if (!clickedInside) {
  //     this.isDropdownOpen = false;
  //   }
  // }
}
