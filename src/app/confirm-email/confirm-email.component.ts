import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxCaptchaModule } from 'ngx-captcha';
import { Subscription } from 'rxjs';
import { UserService } from '../services/user.service';
import { environment } from 'src/environments/environment';
import { RegisterService } from '../services/register.service';
import { Store } from '@ngrx/store';
import * as UserState from '../store/user/user.state';
import * as UserSelectors from '../store/user/user.selectors';

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
  private api = `${environment.apiUrl}`;

  message = 'AUTH.EMAIL.CONFIRM.CAPTCHA_REQUIRED';
  showTimer = false;
  countdown = 5;
  intervalId?: any;

  isCaptchaLoaded = true;
  captchaPassed = false;
  captchaToken: string | null = null;

  constructor(
    private registerService: RegisterService,
    private store: Store<UserState.UserState>
  ) {}

  ngOnInit() {
    this.userSubscription = this.store
      .select(UserSelectors.selectUser)
      .subscribe((user) => {
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

    this.registerService.confirmEmail(token, this.captchaToken).subscribe({
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
        if (this.router.url.startsWith('/confirm')) {
          this.router.navigateByUrl('/');
        }
      }
    }, 1000);
  }
}
