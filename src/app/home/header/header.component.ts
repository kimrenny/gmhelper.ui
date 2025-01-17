import {
  Component,
  HostListener,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationStart } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

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
    private userService: UserService,
    private translate: TranslateService,
    private router: Router,
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

    this.userService.isAuthorized$.subscribe((isAuthenticated) => {
      console.log('isAuthorized subscription:', isAuthenticated);
      this.userIsAuthenticated = isAuthenticated;
      if (isAuthenticated) {
        const userDetails = this.userService.getUserDetails();
        console.log('isAuthorized subscription, user:', userDetails.nickname);
        this.userNickname = userDetails.nickname;
        this.userAvatarUrl =
          userDetails.avatar || 'assets/icons/default-avatar.png';
      } else {
        this.userNickname = 'Guest';
        this.userAvatarUrl = 'assets/icons/default-avatar.png';
      }
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart && event.url === '/') {
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
    this.userService.clearUser();
    this.showUserMenu = false;
    this.router.navigate(['/login']);
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  openUserSettings() {
    this.showUserMenu = false;
    this.router.navigate(['/settings']);
  }
}
