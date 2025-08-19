import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { environment } from 'src/environments/environment';

export type CodeSource = 'email' | 'gauth' | null;

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  private api = `${environment.apiUrl}`;

  private codeSource = new BehaviorSubject<CodeSource>(null);
  codeSource$ = this.codeSource.asObservable();

  private sessionKey = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {}

  setCodeSource(source: CodeSource) {
    this.codeSource.next(source);
  }

  getCodeSource(): CodeSource {
    return this.codeSource.getValue();
  }

  getSessionKey(): string | null {
    return this.sessionKey.getValue();
  }

  setSessionKey(key: string | null) {
    this.sessionKey.next(key);
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

    const MAX_EMAIL_LENGTH = 80;

    if (!email) return 'REGISTER.ERRORS.EMAIL.REQUIRED';
    if (email.length > MAX_EMAIL_LENGTH)
      return 'REGISTER.ERRORS.EMAIL.TOO_LONG';
    if (!emailPattern.test(email)) return 'REGISTER.ERRORS.EMAIL.INVALID';

    const domain = email.split('@')[1];
    if (!allowedDomains.includes(domain))
      return 'REGISTER.ERRORS.EMAIL.NOT_ALLOWED';

    return '';
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
    captchaToken: string
  ) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      username,
      email,
      password,
      captchaToken,
    };

    return this.http.post<ApiResponse<any>>(
      `${this.api}/api/auth/register`,
      body,
      {
        headers,
      }
    );
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
    captchaToken: string,
    rememberMe: boolean
  ) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      email,
      password,
      captchaToken,
      remember: rememberMe,
    };
    return this.http.post<ApiResponse<any>>(
      `${this.api}/api/auth/login`,
      body,
      {
        headers,
      }
    );
  }

  confirmEmailCode(code: string, sessionKey: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      code,
      sessionKey,
    };

    return this.http.post<ApiResponse<any>>(
      `${this.api}/api/auth/confirm-email-code`,
      body,
      { headers }
    );
  }

  confirmTwoFACode(code: string, sessionKey: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      code,
      sessionKey,
    };

    return this.http.post<ApiResponse<any>>(
      `${this.api}/api/auth/confirm-2fa-code`,
      body,
      { headers }
    );
  }

  recoveryPasswordUser(email: string, captchaToken: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      email,
      captchaToken: captchaToken,
    };

    return this.http.post(`${this.api}/api/mail/password-recovery`, body, {
      headers,
    });
  }
}
