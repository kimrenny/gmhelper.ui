import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-confirm-email',
  imports: [CommonModule, TranslateModule],
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss'],
})
export class ConfirmEmailComponent {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);
  private api = 'https://localhost:7057';

  message = 'AUTH.EMAIL.CONFIRM.PROCESSING';
  showTimer = false;
  countdown = 5;
  intervalId?: any;

  constructor() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.http.post(`${this.api}/api/user/confirm`, { token }).subscribe({
        next: () => {
          this.message = 'AUTH.EMAIL.CONFIRM.SUCCESS';
          this.startCountdown();
        },
        error: () => {
          this.message = 'AUTH.EMAIL.CONFIRM.ERROR';
          this.startCountdown();
        },
      });
    }
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
