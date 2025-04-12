import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxCaptchaModule, ReCaptcha2Component } from 'ngx-captcha';
import { RegisterService } from '../services/register.service';
import { Subscription } from 'rxjs';
import { UserService } from '../services/user.service';

@Component({
  standalone: true,
  selector: 'app-password-recovery',
  imports: [CommonModule, TranslateModule, NgxCaptchaModule, FormsModule],
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.scss'],
})
export class PasswordRecoveryComponent implements OnInit, OnDestroy {
  private userSubscription!: Subscription;

  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private api = 'https://localhost:7057';

  password: string = '';

  message = 'AUTH.RECOVERY.CAPTCHA_REQUIRED';
  showTimer = false;
  countdown = 5;
  intervalId?: any;

  isCaptchaLoaded = true;
  captchaPassed = false;
  captchaToken: string | null = null;

  passwordError: string = '';
  passwordStrength: number = 0;
  passwordStrengthBars: number[] = [0, 1, 2];
  showPasswordHint: boolean = false;

  passwordValidations = {
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasDigit: false,
    hasSpecialChar: false,
    notContainsEmail: true,
  };

  passwordVisible = false;

  @ViewChild('captchaElem') captchaElem!: ReCaptcha2Component;

  constructor(
    @Inject(ChangeDetectorRef) private cdr: ChangeDetectorRef,
    private registerService: RegisterService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userSubscription = this.userService.user$.subscribe((user) => {
      if (!(user.nickname === 'Guest' && user.avatar === null)) {
        this.router.navigateByUrl('/');
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  onCaptchaConfirmChange(token: string) {
    this.validatePassword();

    if (this.passwordError || !this.password) {
      this.captchaPassed = false;
      this.captchaToken = null;
      this.captchaElem.resetCaptcha();
      this.message = 'AUTH.RECOVERY.INVALID_PASSWORD';
      return;
    }

    this.captchaPassed = true;
    this.captchaToken = token;
    this.passwordRecovery();
  }

  private passwordRecovery() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token || !this.captchaToken) return;

    this.message = 'AUTH.EMAIL.CONFIRM.PROCESSING';

    this.http
      .patch(`${this.api}/api/user/recovery`, {
        password: this.password,
        token,
        captchaToken: this.captchaToken,
      })
      .subscribe({
        next: () => {
          this.message = 'AUTH.EMAIL.CONFIRM.SUCCESS';
          this.startCountdown();
        },
        error: (error) => {
          if (error.status === 400) {
            const message = error.error?.message;

            switch (message) {
              case 'Invalid confirmation token.':
                this.message = 'AUTH.EMAIL.CONFIRM.INVALID';
                break;
              case 'This confirmation link has already been used.':
                this.message = 'AUTH.EMAIL.CONFIRM.ALREADY_USED';
                break;
              case 'Token expired. A new confirmation link has been sent to your email.':
                this.message = 'AUTH.EMAIL.CONFIRM.NEW_LINK_SENT';
                break;
              case 'Invalid CAPTCHA token.':
              default:
                this.message = 'AUTH.EMAIL.CONFIRM.ERROR';
                break;
            }
          } else {
            this.message = 'AUTH.EMAIL.CONFIRM.ERROR';
          }

          this.startCountdown();
        },
      });
  }

  private startCountdown() {
    this.showTimer = true;
    this.intervalId = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(this.intervalId);
        this.router.navigateByUrl('/');
      }
    }, 1000);
  }

  validatePassword() {
    const { error, strength } = this.registerService.validatePassword(
      this.password,
      '_',
      '_'
    );
    this.passwordError = error;
    this.passwordStrength = strength;
    this.cdr.detectChanges();
  }
}
