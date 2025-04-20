import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxCaptchaModule } from 'ngx-captcha';
import { Subscription } from 'rxjs';
import { UserService } from '../services/user.service';

@Component({
  standalone: true,
  selector: 'app-confirm-email',
  imports: [CommonModule, TranslateModule, NgxCaptchaModule],
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss'],
})
export class ConfirmEmailComponent implements OnInit, OnDestroy {
  private userSubscription!: Subscription;

  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);
  private api = 'https://localhost:7057';

  message = 'AUTH.EMAIL.CONFIRM.CAPTCHA_REQUIRED';
  showTimer = false;
  countdown = 5;
  intervalId?: any;

  isCaptchaLoaded = true;
  captchaPassed = false;
  captchaToken: string | null = null;

  constructor(private userService: UserService) {}

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
    this.captchaPassed = true;
    this.captchaToken = token;
    this.confirmEmail();
  }

  private confirmEmail() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token || !this.captchaToken) return;

    this.message = 'AUTH.EMAIL.CONFIRM.PROCESSING';

    this.http
      .post(`${this.api}/api/auth/confirm`, {
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
}
