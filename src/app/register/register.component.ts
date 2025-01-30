import { Component, ChangeDetectorRef, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxCaptchaModule } from 'ngx-captcha';
import { RegisterService } from '../services/register.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, NgxCaptchaModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  formType: 'signup' | 'login' = 'signup';
  isRegisterMode: boolean = true;
  showForgotPassword: boolean = false;
  recoveryEmail: string = '';
  username: string = '';
  email: string = '';
  password: string = '';
  usernameError: string = '';
  emailError: string = '';
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

  loginEmailError: string = '';
  loginPasswordError: string = '';

  recoveryEmailError: string = '';

  registerFeedbackMessage: string = '';
  loginFeedbackMessage: string = '';
  recoveryFeedbackMessage: string = '';

  captchaRegisterToken: string = '';
  captchaLoginToken: string = '';
  captchaRecoveryToken: string = '';
  registerCaptchaError: string = '';
  loginCaptchaError: string = '';
  recoveryCaptchaError: string = '';

  isCaptchaLoaded: boolean = false;
  userIpAddress: string = '';

  constructor(
    private registerService: RegisterService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(UserService) private userService: UserService
  ) {
    console.log('UserService instance:', userService);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.formType = params['type'] || 'signup';
      this.isRegisterMode = this.formType === 'signup';
    });

    this.registerService.getUserIpAddress();
    this.registerService.userIpAddress.subscribe(
      (ip) => (this.userIpAddress = ip)
    );

    this.route.queryParams.subscribe((params) => {
      const section = params['section'];
      if (section) {
        this.router.navigate([''], {
          queryParams: { section: section },
          replaceUrl: true,
        });
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.isCaptchaLoaded = true;
      this.cdr.detectChanges();
    }, 500);
  }

  toggleFormMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.formType = this.isRegisterMode ? 'signup' : 'login';

    if (!this.isRegisterMode) {
      this.username = '';
      this.usernameError = '';
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { type: this.formType },
      replaceUrl: true,
    });

    this.cdr.detectChanges();
  }

  register(): void {
    this.validateUsername();
    this.validateEmail();
    this.validatePassword();
    if (this.usernameError || this.emailError || this.passwordError) {
      this.registerFeedbackMessage = 'REGISTER.ERRORS.INCORRECT_DATA';
      this.clearMessageAfterDelay('register');
      return;
    }

    if (!this.captchaRegisterToken) {
      this.registerCaptchaError = 'REGISTER.ERRORS.CAPTCHA.REQUIRED';
      this.clearMessageAfterDelay('register');
      return;
    }

    this.registerService
      .registerUser(
        this.username,
        this.email,
        this.password,
        this.userIpAddress,
        this.captchaRegisterToken
      )
      .subscribe({
        next: (response) => {
          console.log(response);
          this.registerFeedbackMessage = 'REGISTER.ERRORS.REGISTRATION.SUCCESS';
          this.clearMessageAfterDelay('register');
        },
        error: (error) => {
          console.error('Registration error:', error);
          switch (error.error) {
            case 'Invalid data.':
              this.registerFeedbackMessage =
                'REGISTER.ERRORS.REGISTRATION.FAIL.DATA';
              break;
            case 'Invalid CAPTCHA token.':
              this.registerFeedbackMessage =
                'REGISTER.ERRORS.REGISTRATION.FAIL.CAPTCHA';
              break;
            case 'Violation of service rules. All user accounts have been blocked.':
              this.registerFeedbackMessage =
                'REGISTER.ERRORS.REGISTRATION.FAIL.BANNED';
              break;
            default:
              this.registerFeedbackMessage =
                'REGISTER.ERRORS.REGISTRATION.FAIL.UNKNOWN';
              break;
          }
          this.clearMessageAfterDelay('register');
        },
      });
  }

  login() {
    this.validateLoginEmail();
    this.validateLoginPassword();

    if (this.loginEmailError || this.loginPasswordError) {
      this.loginFeedbackMessage = 'REGISTER.ERRORS.INCORRECT_DATA';
      this.clearMessageAfterDelay('login');
      return;
    }

    if (!this.captchaLoginToken) {
      this.loginCaptchaError = 'REGISTER.ERRORS.CAPTCHA.REQUIRED';
      this.clearMessageAfterDelay('login');
      return;
    }

    this.registerService
      .loginUser(
        this.email,
        this.password,
        this.userIpAddress,
        this.captchaLoginToken
      )
      .subscribe({
        next: (response: any) => {
          this.captchaLoginToken = '';
          console.log('login response:', response);
          localStorage.setItem('authToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          this.userService.checkAuthentication();
          this.loginFeedbackMessage = 'REGISTER.ERRORS.LOGIN.SUCCESS';
          this.clearMessageAfterDelay('login');
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1000);
        },
        error: (error) => {
          console.error('Login error:', error);
          switch (error.error) {
            case 'Invalid credentials.':
              this.loginFeedbackMessage = 'REGISTER.ERRORS.LOGIN.FAIL.DATA';
              break;
            case 'Invalid CAPTCHA token.':
              this.loginFeedbackMessage = 'REGISTER.ERRORS.LOGIN.FAIL.CAPTCHA';
              break;
            case 'User is banned.':
              this.loginFeedbackMessage = 'REGISTER.ERRORS.LOGIN.FAIL.BANNED';
              break;
            case 'Suspicious activity detected. Accounts blocked.':
              this.loginFeedbackMessage = 'REGISTER.ERRORS.LOGIN.FAIL.BANNED';
              break;
            case 'User not found.':
              this.loginFeedbackMessage =
                'REGISTER.ERRORS.LOGIN.FAIL.USERNOTFOUND';
              break;
            default:
              this.loginFeedbackMessage = 'REGISTER.ERRORS.LOGIN.FAIL.UNKNOWN';
              break;
          }
          this.clearMessageAfterDelay('login');
        },
      });
  }

  validateUsername() {
    this.usernameError = this.registerService.validateUsername(this.username);
  }

  validateEmail() {
    this.emailError = this.registerService.validateEmail(this.email);
  }

  validatePassword() {
    const { error, strength } = this.registerService.validatePassword(
      this.password,
      this.username,
      this.email
    );
    this.passwordError = error;
    this.passwordStrength = strength;
    this.cdr.detectChanges();
  }

  validateLoginEmail() {
    this.loginEmailError = this.registerService.validateEmail(this.email);
  }

  validateRecoveryEmail() {
    this.recoveryEmailError = this.registerService.validateEmail(
      this.recoveryEmail
    );
  }

  validateLoginPassword() {
    this.loginPasswordError = this.registerService.validateLoginPassword(
      this.password
    );
  }

  clearMessageAfterDelay(
    messageType: 'register' | 'login' | 'recovery',
    delay = 3000
  ) {
    setTimeout(() => {
      if (messageType === 'register') this.registerFeedbackMessage = '';
      if (messageType === 'login') this.loginFeedbackMessage = '';
      if (messageType === 'recovery') this.recoveryFeedbackMessage = '';
      this.cdr.detectChanges();
    }, delay);
  }

  openForgotPassword() {
    this.showForgotPassword = true;
    this.cdr.detectChanges();
  }

  closeForgotPassword() {
    this.showForgotPassword = false;
    this.recoveryFeedbackMessage = '';
    this.recoveryEmail = '';
    this.cdr.detectChanges();
  }

  submitPasswordRecovery() {
    this.validateRecoveryEmail();
    if (this.recoveryEmailError) {
      this.clearMessageAfterDelay('recovery');
      return;
    }

    if (!this.captchaRecoveryToken) {
      this.recoveryCaptchaError = 'REGISTER.ERRORS.CAPTCHA.REQUIRED';
      this.clearMessageAfterDelay('recovery');
      return;
    }

    this.registerService
      .recoveryPasswordUser(
        this.recoveryEmail,
        this.userIpAddress,
        this.captchaRecoveryToken
      )
      .subscribe({
        next: () => {
          this.captchaRecoveryToken = '';
          this.recoveryFeedbackMessage = 'REGISTER.ERRORS.RECOVER.SUCCESS';
          this.clearMessageAfterDelay('recovery');
          setTimeout(() => this.closeForgotPassword(), 2000);
        },
        error: (error) => {
          console.error(error);
          this.recoveryFeedbackMessage = 'REGISTER.ERRORS.RECOVER.FAIL';
          this.clearMessageAfterDelay('recovery');
        },
      });
  }

  onCaptchaRegisterChange(token: string): void {
    this.captchaRegisterToken = token;
    this.registerCaptchaError = '';
  }

  onCaptchaLoginChange(token: string): void {
    this.captchaLoginToken = token;
    this.loginCaptchaError = '';
  }

  onCaptchaRecoveryChange(token: string): void {
    this.captchaRecoveryToken = token;
    this.recoveryCaptchaError = '';
  }
}
