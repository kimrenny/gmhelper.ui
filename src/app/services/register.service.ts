import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  public userIpAddress = new BehaviorSubject<string>('');

  constructor(private http: HttpClient) {}

  getUserIpAddress() {
    this.http
      .get<{ ip: string }>('https://api.ipify.org?format=json')
      .subscribe({
        next: (response) => {
          this.userIpAddress.next(response.ip);
        },
        error: (error) => {
          console.error('Error fetching IP address:', error);
          this.userIpAddress.next('');
        },
      });
  }

  validateUsername(username: string): string {
    const usernamePattern = /^[A-Za-z][A-Za-z0-9]{3,23}$/;

    if (!username) {
      return 'REGISTER.ERRORS.USERNAME.REQUIRED';
    } else if (!usernamePattern.test(username)) {
      return 'REGISTER.ERRORS.USERNAME.INVALID';
    } else {
      return '';
    }
  }

  validateEmail(email: string): string {
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
      return 'REGISTER.ERRORS.EMAIL.REQUIRED';
    } else if (!emailPattern.test(email)) {
      return 'REGISTER.ERRORS.EMAIL.INVALID';
    } else {
      const domain = email.split('@')[1];
      if (!allowedDomains.includes(domain)) {
        return 'REGISTER.ERRORS.EMAIL.NOT_ALLOWED';
      } else {
        return '';
      }
    }
  }

  validatePassword(
    password: string,
    username: string,
    email: string
  ): { error: string; strength: number } {
    let strength = 0;
    const passwordValidations = {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasDigit: /[0-9]/.test(password),
      hasSpecialChar: /[^a-zA-Z0-9]/.test(password),
      notContainsEmail:
        !password.toLowerCase().includes(email.toLowerCase()) &&
        !password.toLowerCase().includes(username.toLowerCase()),
    };
    if (passwordValidations.hasMinLength) strength++;
    if (passwordValidations.hasUpperCase) strength++;
    if (passwordValidations.hasLowerCase) strength++;
    if (passwordValidations.hasDigit) strength++;
    if (passwordValidations.hasSpecialChar) strength++;

    let error = '';

    if (!password) {
      error = 'REGISTER.ERRORS.PASSWORD.REQUIRED';
    } else if (strength < 3) {
      error = 'REGISTER.ERRORS.PASSWORD.TOO_WEAK';
    } else if (strength < 5) {
      error = 'REGISTER.ERRORS.PASSWORD.WEAK';
    }
    return { error, strength };
  }

  registerUser(
    username: string,
    email: string,
    password: string,
    userIpAddress: string,
    captchaToken: string
  ) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      username,
      email,
      password,
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
      },
      ipAddress: userIpAddress,
      captchaToken,
    };

    return this.http.post('https://localhost:7057/api/user/register', body, {
      headers,
    });
  }

  validateLoginPassword(password: string): string {
    if (!password) {
      return 'REGISTER.INPUT.ERRORS.PASSWORD.REQUIRED';
    } else if (password.length < 8) {
      return 'REGISTER.INPUT.ERRORS.PASSWORD.MIN_LENGTH';
    } else {
      return '';
    }
  }

  loginUser(
    email: string,
    password: string,
    userIpAddress: string,
    captchaToken: string
  ) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      email,
      password,
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
      },
      ipAddress: userIpAddress,
      captchaToken,
    };
    return this.http.post('https://localhost:7057/api/user/login', body, {
      headers,
    });
  }

  recoveryPasswordUser(
    email: string,
    userIpAddress: string,
    captchaToken: string
  ) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      email,
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
      },
      ipAddress: userIpAddress,
      captchaToken: captchaToken,
    };

    console.log('Password Recovery Request:', {
      url: 'https://localhost:7057/api/user/password-recovery',
      headers,
      body,
    });

    return this.http.post(
      'https://localhost:7057/api/user/password-recovery',
      body,
      {
        headers,
      }
    );
  }
}
