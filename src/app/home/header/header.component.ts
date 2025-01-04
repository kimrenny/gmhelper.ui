import {
  Component,
  HostListener,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationStart } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
    this.userIsAuthenticated = false;
    this.userAvatarUrl = 'assets/icons/default-avatar.png';
    this.router.navigate(['/login']);
  }

  checkAuthentication() {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      this.userIsAuthenticated = true;
      this.loadUserDetails(authToken);
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

          const avatarUrl = URL.createObjectURL(response.avatar);
          this.userAvatarUrl = avatarUrl;

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching user details:', err);
          switch (err.error) {
            case 'User is blocked.':
              this.userIsAuthenticated = false;
              this.userAvatarUrl = 'assets/icons/default-avatar.png';
              localStorage.removeItem('authToken');
              break;
            case 'User not found.':
              this.userIsAuthenticated = false;
              this.userAvatarUrl = 'assets/icons/default-avatar.png';
              localStorage.removeItem('authToken');
              break;
            case 'Invalid data.':
              this.userIsAuthenticated = false;
              this.userAvatarUrl = 'assets/icons/default-avatar.png';
              localStorage.removeItem('authToken');
              break;
            case 'Invalid token.':
              this.userIsAuthenticated = false;
              this.userAvatarUrl = 'assets/icons/default-avatar.png';
              localStorage.removeItem('authToken');
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
