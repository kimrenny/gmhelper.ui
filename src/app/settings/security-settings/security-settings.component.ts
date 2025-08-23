import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { SecurityService } from 'src/app/services/security.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './security-settings.component.html',
  styleUrls: ['./security-settings.component.scss'],
})
export class SecuritySettingsComponent implements OnInit {
  twoFactorEnabled = false;
  qrCode: string | null = null;
  secret: string | null = null;
  verificationCode: string = '';
  twoFactorMode: 'always' | 'ip_only' = 'always';

  pendingModeChange: 'always' | 'ip_only' | null = null;
  pendingDisable = false;

  constructor(
    private userService: UserService,
    private securityService: SecurityService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.userService.user$.subscribe((user) => {
      this.twoFactorEnabled = user.twoFactor;
      this.twoFactorMode = 'always';

      console.log('this.twoFactorEnabled:', this.twoFactorEnabled);
    });
  }

  generate2FA() {
    this.securityService.generate2FA().subscribe({
      next: (res) => {
        if (res.data && res.data.qrCode != '' && res.data.secret != '') {
          this.qrCode = res.data.qrCode;
          this.secret = res.data.secret;
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(
          this.translate.instant('SETTINGS.ERROR.MESSAGE'),
          this.translate.instant('SETTINGS.ERROR.TITLE')
        );
      },
    });
  }

  verify2FA() {
    this.securityService.verify2FA(this.verificationCode).subscribe({
      next: () => {
        this.twoFactorEnabled = true;
        this.userService.getUserDetails();
        this.toastr.success(
          this.translate.instant('SETTINGS.SUCCESS.MESSAGE'),
          this.translate.instant('SETTINGS.SUCCESS.TITLE')
        );
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(
          this.translate.instant('SETTINGS.ERROR.MESSAGE'),
          this.translate.instant('SETTINGS.ERROR.TITLE')
        );
      },
    });
  }

  selectMode(mode: 'always' | 'ip_only') {
    if (mode == this.twoFactorMode) {
      this.pendingModeChange = null;
      this.verificationCode = '';
      return;
    }

    this.pendingModeChange = mode;
    this.pendingDisable = false;
    this.verificationCode = '';
  }

  confirmModeChange() {
    if (!this.pendingModeChange) return;

    this.securityService
      .update2FAMode(this.pendingModeChange, this.verificationCode)
      .subscribe({
        next: () => {
          this.twoFactorMode = this.pendingModeChange!;
          this.pendingModeChange = null;
          this.verificationCode = '';
          this.toastr.success(
            this.translate.instant('SETTINGS.SUCCESS.MESSAGE'),
            this.translate.instant('SETTINGS.SUCCESS.TITLE')
          );
        },
        error: () => {
          this.toastr.error(
            this.translate.instant('SETTINGS.ERROR.MESSAGE'),
            this.translate.instant('SETTINGS.ERROR.TITLE')
          );
        },
      });
  }

  cancelModeChange() {
    this.pendingModeChange = null;
    this.verificationCode = '';
  }

  requestDisable2FA() {
    this.pendingDisable = true;
    this.pendingModeChange = null;
    this.verificationCode = '';
  }

  confirmDisable2FA() {
    this.securityService.disable2FA(this.verificationCode).subscribe({
      next: () => {
        this.twoFactorEnabled = false;
        this.pendingDisable = false;
        this.qrCode = null;
        this.secret = null;
        this.verificationCode = '';
        this.toastr.success(
          this.translate.instant('SETTINGS.SUCCESS.MESSAGE'),
          this.translate.instant('SETTINGS.SUCCESS.TITLE')
        );
      },
      error: () => {
        this.toastr.error(
          this.translate.instant('SETTINGS.ERROR.MESSAGE'),
          this.translate.instant('SETTINGS.ERROR.TITLE')
        );
      },
    });
  }
}
