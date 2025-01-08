import {
  Component,
  HostListener,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationStart } from '@angular/router';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [CommonModule],
})
export class HeaderComponent implements OnInit {
  showLanguageMenu = false;
  userIsAuthenticated = false;
  userAvatarUrl = 'assets/icons/default-avatar.png';
  userNickname = 'Guest';
  showUserMenu = false;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      this.translate.use(savedLanguage);
    } else {
      this.translate.setDefaultLang('en');
      this.translate.use('en');
    }

    this.checkAuthentication();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart && event.url === '/') {
        this.checkAuthentication();
        this.showUserMenu = false;
      }
    });
  }

  toggleLanguageMenu() {
    this.showLanguageMenu = !this.showLanguageMenu;
  }

  selectLanguage(language: string) {
    this.translate.use(language);
    localStorage.setItem('language', language);
    this.showLanguageMenu = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    const languageMenu = document.querySelector('.language-dropdown');
    const userMenu = document.querySelector('.user-menu');

    if (languageMenu && !languageMenu.contains(targetElement)) {
      this.showLanguageMenu = false;
    }

    if (userMenu && !userMenu.contains(targetElement)) {
      this.showUserMenu = false;
    }
  }

  navigateToRegistration(type: 'signup' | 'login') {
    this.router.navigate(['/register'], { queryParams: { type } });
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    this.userIsAuthenticated = false;
    this.userAvatarUrl = 'assets/icons/default-avatar.png';
    this.router.navigate(['/login']);
  }

  checkAuthentication() {
    const authToken = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (authToken) {
      const isTokenAboutToExpire = this.isTokenExpired(authToken);
      if (isTokenAboutToExpire && refreshToken) {
        this.refreshToken(refreshToken).then(() => {
          this.loadUserDetails(localStorage.getItem('authToken')!);
        });
      } else if (!isTokenAboutToExpire) {
        this.userIsAuthenticated = true;
        this.loadUserDetails(authToken);
      } else {
        this.logout();
      }
    }
  }

  isTokenExpired(token: string, bufferTime: number = 5 * 60 * 1000): boolean {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    console.log('Token expiration time:', exp, 'Current time:', Date.now());
    return Date.now() >= exp - bufferTime;
  }

  async refreshToken(refreshToken: string, attempt: number = 0) {
    try {
      console.log('Refreshing token with refresh token:', refreshToken);
      const response = await firstValueFrom(
        this.http.post<{ accessToken: string; refreshToken: string }>(
          'https://localhost:7057/api/user/refresh-token',
          JSON.stringify({ refreshToken }),
          {
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );
      console.log('Token refreshed:', response.accessToken);
      console.log('RefreshToken: ', response.refreshToken);
      localStorage.setItem('authToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      this.userIsAuthenticated = true;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        console.error('HTTP error:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      console.error(`Attempt ${++attempt}`);

      if (attempt >= 3) {
        this.logout();
        return;
      }
      setTimeout(() => this.refreshToken(refreshToken, attempt), 2500);
    }
  }

  loadUserDetails(token: string, attempt: number = 0) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get<{ avatar: Blob; nickname: string }>(
        'https://localhost:7057/api/user/details',
        { headers, responseType: 'json' }
      )
      .subscribe({
        next: (response) => {
          this.userNickname = response.nickname;
          if (response.avatar != null) {
            const avatarUrl = `data:image/jpeg;base64,${response.avatar}`;
            this.userAvatarUrl = avatarUrl;
          }

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching user details:', err);
          switch (err.error) {
            case 'User is blocked.':
            case 'User not found.':
            case 'Invalid data.':
            case 'Invalid token.':
              this.logout();
              break;
            default:
              console.error(
                `Unknown error: ${err.error}. Attempt ${++attempt}`
              );
              if (attempt >= 3) {
                break;
              }
              setTimeout(() => this.loadUserDetails(token, attempt), 2500);
              break;
          }
        },
      });
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  openUserSettings() {
    this.showUserMenu = false;
    this.router.navigate(['/settings']);
  }
}
