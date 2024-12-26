import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxCaptchaModule } from 'ngx-captcha';

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

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.formType = params['type'] || 'signup';
      this.isRegisterMode = this.formType === 'signup';
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

  validateUsername() {
    const usernamePattern = /^[A-Za-z][A-Za-z0-9]{3,23}$/;

    if (!this.username) {
      this.usernameError = 'REGISTER.ERRORS.USERNAME.REQUIRED';
    } else if (!usernamePattern.test(this.username)) {
      this.usernameError = 'REGISTER.ERRORS.USERNAME.INVALID';
    } else {
      this.usernameError = '';
    }
  }

  validateEmail() {
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

    if (!this.email) {
      this.emailError = 'REGISTER.ERRORS.EMAIL.REQUIRED';
    } else if (!emailPattern.test(this.email)) {
      this.emailError = 'REGISTER.ERRORS.EMAIL.INVALID';
    } else {
      const domain = this.email.split('@')[1];
      if (!allowedDomains.includes(domain)) {
        this.emailError = 'REGISTER.ERRORS.EMAIL.NOT_ALLOWED';
      } else {
        this.emailError = '';
      }
    }
  }

  validatePassword() {
    this.passwordStrength = this.calculatePasswordStrength(this.password);
    if (!this.password) {
      this.passwordError = 'REGISTER.ERRORS.PASSWORD.REQUIRED';
    } else if (this.passwordStrength < 3) {
      this.passwordError = 'REGISTER.ERRORS.PASSWORD.TOO_WEAK';
    } else if (this.passwordStrength < 5) {
      this.passwordError = 'REGISTER.ERRORS.PASSWORD.WEAK';
    } else {
      this.passwordError = '';
    }
    this.cdr.detectChanges();
  }

  calculatePasswordStrength(password: string): number {
    let strength = 0;

    this.passwordValidations.hasMinLength = password.length >= 8;
    this.passwordValidations.hasUpperCase = /[A-Z]/.test(password);
    this.passwordValidations.hasLowerCase = /[a-z]/.test(password);
    this.passwordValidations.hasDigit = /[0-9]/.test(password);
    this.passwordValidations.hasSpecialChar = /[^a-zA-Z0-9]/.test(password);

    const emailPart = this.email.split('@')[0].toLowerCase();
    const fullEmail = this.email.toLowerCase();
    const username = this.username.toLowerCase();

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

  validateLoginEmail() {
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
    if (!this.email) {
      this.loginEmailError = 'REGISTER.ERRORS.EMAIL.REQUIRED';
    } else if (!emailPattern.test(this.email)) {
      this.loginEmailError = 'REGISTER.ERRORS.EMAIL.INVALID';
    } else {
      const domain = this.email.split('@')[1];
      if (!allowedDomains.includes(domain)) {
        this.loginEmailError = 'REGISTER.ERRORS.EMAIL.NOT_ALLOWED';
      } else {
        this.loginEmailError = '';
      }
    }
  }

  validateRecoveryEmail() {
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
    if (!this.email) {
      this.recoveryEmailError = 'REGISTER.ERRORS.EMAIL.REQUIRED';
    } else if (!emailPattern.test(this.email)) {
      this.recoveryEmailError = 'REGISTER.ERRORS.EMAIL.INVALID';
    } else {
      const domain = this.email.split('@')[1];
      if (!allowedDomains.includes(domain)) {
        this.recoveryEmailError = 'REGISTER.ERRORS.EMAIL.NOT_ALLOWED';
      } else {
        this.recoveryEmailError = '';
      }
    }
  }

  validateLoginPassword() {
    if (!this.password) {
      this.loginPasswordError = 'REGISTER.ERRORS.PASSWORD.REQUIRED';
    } else if (this.password.length < 8) {
      this.loginPasswordError = 'REGISTER.ERRORS.PASSWORD.MIN_LENGTH';
    } else {
      this.loginPasswordError = '';
    }
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
    console.log('Open Forgot Password form');
    this.showForgotPassword = true;
    this.cdr.detectChanges();
  }

  closeForgotPassword() {
    this.showForgotPassword = false;
    this.recoveryFeedbackMessage = '';
    this.recoveryEmail = '';
    this.cdr.detectChanges();
  }

  register() {
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

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      username: this.username,
      email: this.email,
      password: this.password,
      captchaToken: this.captchaRegisterToken,
    };

    console.log('Register Request:', {
      url: 'https://localhost:7057/api/user/register',
      headers,
      body,
    });

    this.http
      .post('https://localhost:7057/api/user/register', body, { headers })
      .subscribe({
        next: (response) => {
          this.captchaRegisterToken = '';
          console.log('Registration successful:', response);
          this.username = '';
          this.email = '';
          this.password = '';
          this.registerFeedbackMessage = 'REGISTER.ERRORS.REGISTRATION.SUCCESS';
          this.clearMessageAfterDelay('register');
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.registerFeedbackMessage = 'REGISTER.ERRORS.REGISTRATION.FAIL';
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

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      email: this.email,
      password: this.password,
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
      },
      captchaToken: this.captchaLoginToken,
    };

    console.log('Login Request:', {
      url: 'https://localhost:7057/api/user/login',
      headers,
      body,
    });

    this.http
      .post('https://localhost:7057/api/user/login', body, { headers })
      .subscribe({
        next: (response: any) => {
          this.captchaLoginToken = '';
          console.log('Login successful:', response);
          localStorage.setItem('authToken', response.token);
          this.loginFeedbackMessage = 'REGISTER.ERRORS.LOGIN.SUCCESS';
          this.clearMessageAfterDelay('login');
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1000);
        },
        error: (error) => {
          console.error('Login error:', error);
          this.loginFeedbackMessage = 'REGISTER.ERRORS.LOGIN.FAIL';
          this.clearMessageAfterDelay('login');
        },
      });
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

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      email: this.recoveryEmail,
      captchaToken: this.captchaRecoveryToken,
    };

    console.log('Password Recovery Request:', {
      url: 'https://localhost:7057/api/user/password-recovery',
      headers,
      body,
    });

    this.http
      .post('https://localhost:7057/api/user/password-recovery', body, {
        headers,
      })
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
