import {
  Component,
  HostListener,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
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

    if (languageMenu && !languageMenu.contains(targetElement)) {
      this.showLanguageMenu = false;
    }
  }

  navigateToRegistration(type: 'signup' | 'login') {
    this.router.navigate(['/register'], { queryParams: { type } });
  }

  logout() {
    localStorage.removeItem('user');
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

  loadUserDetails(token: string) {
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
          this.userAvatarUrl = 'assets/icons/default-avatar.png';
        },
      });
  }
}
