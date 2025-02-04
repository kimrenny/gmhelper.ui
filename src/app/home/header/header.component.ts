import {
  Component,
  HostListener,
  OnInit,
  ChangeDetectorRef,
  Inject,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationStart, RouterModule } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
import { TokenService } from 'src/app/services/token.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [CommonModule, RouterModule],
})
export class HeaderComponent implements OnInit, OnDestroy {
  showLanguageMenu = false;
  userIsAuthenticated = false;
  userAvatarUrl = 'assets/icons/default-avatar.png';
  userNickname = 'Guest';
  userRole: string | null = 'Guest';
  showUserMenu = false;

  private subscriptions = new Subscription();

  constructor(
    @Inject(UserService) private userService: UserService,
    private tokenService: TokenService,
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

    const authSub = this.userService.isAuthorized$.subscribe(
      (isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
      }
    );

    const userSub = this.userService.user$.subscribe((userDetails) => {
      this.userNickname = userDetails.nickname;
      this.userAvatarUrl =
        userDetails.avatar || 'assets/icons/default-avatar.png';
      this.cdr.detectChanges();
    });

    const routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart && event.url === '/') {
        this.showUserMenu = false;
      }
    });

    const roleSub = this.tokenService.userRole$.subscribe((role) => {
      this.userRole = role;
      this.cdr.detectChanges();
    });

    this.subscriptions.add(authSub);
    this.subscriptions.add(userSub);
    this.subscriptions.add(routerSub);
    this.subscriptions.add(roleSub);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
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

  openAdminPanel() {
    if (!this.checkAdminAccess()) return;

    this.showUserMenu = false;
    this.router.navigate(['/admin']);
  }

  checkAdminAccess() {
    return this.userRole === 'Admin' || this.userRole === 'Owner'
      ? true
      : false;
  }
}
